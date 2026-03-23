"""
Database setup. Uses PostgreSQL when DATABASE_URL is set (persistent), else SQLite (local).
"""

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Use DATABASE_URL for persistent storage (e.g. Neon, Render Postgres); else SQLite (ephemeral on Render free tier)
_DATABASE_URL = os.environ.get("DATABASE_URL")
if _DATABASE_URL:
    # Neon/Render Postgres may use postgres://; SQLAlchemy expects postgresql://
    _url = _DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = _url
    _connect_args = {}
else:
    _BACKEND_DIR = Path(__file__).resolve().parent.parent
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{_BACKEND_DIR / 'putting.db'}"
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,  # Verify connections before use (helps with Neon scale-to-zero)
    pool_recycle=300,   # Recycle connections every 5 min (avoids stale connections)
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

    dialect = engine.dialect.name
    with engine.connect() as conn:
        if dialect == "sqlite":
            r = conn.execute(text("PRAGMA table_info(sessions)"))
            cols = [row[1] for row in r.fetchall()]
            if "official_attempts_count" not in cols:
                conn.execute(text("ALTER TABLE sessions ADD COLUMN official_attempts_count INTEGER"))
                conn.commit()
        else:
            # PostgreSQL
            r = conn.execute(
                text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'sessions' AND column_name = 'official_attempts_count'"
                )
            )
            if r.fetchone() is None:
                conn.execute(text("ALTER TABLE sessions ADD COLUMN official_attempts_count INTEGER"))
                conn.commit()


def get_db():
    """FastAPI dependency yielding a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
