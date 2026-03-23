"""User routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Session as SessionModel, Attempt as AttemptModel
from app.schemas import UserRead, UserCreate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a new user (player)."""
    name = user_in.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    user = User(name=name, preferred_scoring_mode=user_in.preferred_scoring_mode)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    """List all users. MVP: typically one default user."""
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by id."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Permanently remove a user (player) and all their sessions and attempts. Not allowed for last remaining user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    total_users = db.query(User).count()
    if total_users <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot remove the last player.",
        )
    # Delete in order to satisfy foreign keys: attempts -> sessions -> user
    user_sessions = db.query(SessionModel).filter(SessionModel.user_id == user_id).all()
    for sess in user_sessions:
        db.query(AttemptModel).filter(AttemptModel.session_id == sess.id).delete()
    db.query(SessionModel).filter(SessionModel.user_id == user_id).delete()
    db.delete(user)
    db.commit()
