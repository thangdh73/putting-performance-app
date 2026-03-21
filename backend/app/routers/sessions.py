"""Session routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Attempt as AttemptModel, Session as SessionModel
from app.schemas import AttemptCreate, AttemptRead, SessionCreate, SessionRead
from app.services.scoring import calculate_session_totals
from app.services.scoring.broadie import broadie_points

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionRead])
def list_sessions(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Query(None),
    drill_id: Optional[int] = Query(None),
):
    """List sessions with optional filters."""
    q = db.query(SessionModel).order_by(SessionModel.session_date.desc())
    if user_id is not None:
        q = q.filter(SessionModel.user_id == user_id)
    if drill_id is not None:
        q = q.filter(SessionModel.drill_id == drill_id)
    return q.limit(100).all()


@router.post("", response_model=SessionRead, status_code=201)
def create_session(session_in: SessionCreate, db: Session = Depends(get_db)):
    """Create a new session. Scoring computed when attempts added."""
    session = SessionModel(
        user_id=session_in.user_id,
        drill_id=session_in.drill_id,
        session_date=session_in.session_date,
        scoring_mode=session_in.scoring_mode,
        notes=session_in.notes,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get session by id."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/attempts", response_model=list[AttemptRead])
def list_attempts(session_id: int, db: Session = Depends(get_db)):
    """List attempts for a session, ordered by attempt_number."""
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    attempts = db.query(AttemptModel).filter(AttemptModel.session_id == session_id).order_by(AttemptModel.attempt_number).all()
    return attempts


@router.post("/{session_id}/attempts", response_model=AttemptRead, status_code=201)
def add_attempt(
    session_id: int,
    attempt_in: AttemptCreate,
    db: Session = Depends(get_db),
):
    """Add an attempt and recalculate session totals. Broadie points computed server-side."""
    session = (
        db.query(SessionModel)
        .options(joinedload(SessionModel.drill), joinedload(SessionModel.attempts))
        .filter(SessionModel.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    points = attempt_in.points_awarded
    if session.drill.category == "broadie" and points is None:
        points = float(
            broadie_points(
                is_holed_first_putt=attempt_in.is_holed_first_putt is True,
                is_first_putt_short=attempt_in.is_first_putt_short,
                putts_to_hole_out=int(attempt_in.putts_to_hole_out or 0),
            )
        )

    attempt = AttemptModel(
        session_id=session_id,
        attempt_number=attempt_in.attempt_number,
        hole_group=attempt_in.hole_group,
        distance_ft=attempt_in.distance_ft,
        result_type=attempt_in.result_type,
        is_holed_first_putt=attempt_in.is_holed_first_putt,
        is_first_putt_short=attempt_in.is_first_putt_short,
        putts_to_hole_out=attempt_in.putts_to_hole_out,
        points_awarded=points,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    db.refresh(session)

    totals = calculate_session_totals(
        drill_category=session.drill.category,
        drill_code=session.drill.code,
        benchmark_json=session.drill.benchmark_json,
        attempts=session.attempts,
        scoring_mode=session.scoring_mode,
    )
    for k, v in totals.items():
        if v is not None:
            setattr(session, k, v)
    db.commit()
    db.refresh(session)

    return attempt
