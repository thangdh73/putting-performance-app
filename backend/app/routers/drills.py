"""Drill routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Drill
from app.schemas import DrillRead

router = APIRouter(prefix="/drills", tags=["drills"])


@router.get("", response_model=list[DrillRead])
def list_drills(
    db: Session = Depends(get_db),
    active_only: bool = Query(True, description="Filter to active drills only"),
):
    """List all drills, optionally filtering by active status."""
    q = db.query(Drill)
    if active_only:
        q = q.filter(Drill.is_active == True)
    return q.order_by(Drill.id).all()


@router.get("/{drill_id}", response_model=DrillRead)
def get_drill(drill_id: int, db: Session = Depends(get_db)):
    """Get drill by id."""
    drill = db.query(Drill).filter(Drill.id == drill_id).first()
    if not drill:
        raise HTTPException(status_code=404, detail="Drill not found")
    return drill
