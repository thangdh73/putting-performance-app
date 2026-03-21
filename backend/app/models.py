"""ORM models for User, Drill, Session, Attempt."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Golfer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    preferred_scoring_mode: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="user")


class Drill(Base):
    __tablename__ = "drills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instructions_markdown: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benchmark_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="drill")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    drill_id: Mapped[int] = mapped_column(ForeignKey("drills.id"), nullable=False)
    session_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    scoring_mode: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    total_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    attempts_required: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    made_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_attempts: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    percentage_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    benchmark_label: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
    drill: Mapped["Drill"] = relationship("Drill", back_populates="sessions")
    attempts: Mapped[list["Attempt"]] = relationship("Attempt", back_populates="session", order_by="Attempt.attempt_number")


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    hole_group: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    distance_ft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    result_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_holed_first_putt: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    is_first_putt_short: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    putts_to_hole_out: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    points_awarded: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["Session"] = relationship("Session", back_populates="attempts")
