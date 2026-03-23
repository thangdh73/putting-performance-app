"""
SQLite database setup.
Creates tables and seeds data on first run.
"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Resolve DB path next to the backend package (run uvicorn from backend/)
_BACKEND_DIR = Path(__file__).resolve().parent.parent
SQLALCHEMY_DATABASE_URL = f"sqlite:///{_BACKEND_DIR / 'putting.db'}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""


def init_db() -> None:
    """
    Create all tables and run seed data.
    Idempotent: safe to call on every startup.
    """
    from app import models  # noqa: F401 - register tables with Base.metadata

    Base.metadata.create_all(bind=engine)
    _migrate_add_official_attempts_count()
    from app.seed import run_seed

    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


def _migrate_add_official_attempts_count() -> None:
    """Add official_attempts_count column to sessions if missing (for existing DBs)."""
    from sqlalchemy import text

    with engine.connect() as conn:
        r = conn.execute(text("PRAGMA table_info(sessions)"))
        cols = [row[1] for row in r.fetchall()]
        if "official_attempts_count" not in cols:
            conn.execute(text("ALTER TABLE sessions ADD COLUMN official_attempts_count INTEGER"))
            conn.commit()


def get_db():
    """FastAPI dependency yielding a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
