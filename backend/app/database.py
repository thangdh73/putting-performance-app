"""
Database setup. Uses PostgreSQL when DATABASE_URL is set (persistent), else SQLite (local).
"""

import os
import time
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Use DATABASE_URL for persistent storage (e.g. Neon, Render Postgres); else SQLite (ephemeral on Render free tier)
_DATABASE_URL = os.environ.get("DATABASE_URL")
if _DATABASE_URL:
    # Neon/Render Postgres may use postgres://; SQLAlchemy expects postgresql://
    _url = _DATABASE_URL.replace("postgres://", "postgresql://", 1)
    # Allow 30s for Neon to wake from sleep (scale-to-zero)
    _sep = "&" if "?" in _url else "?"
    _url = f"{_url}{_sep}connect_timeout=30"
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
    Retries on Postgres to allow Neon (scale-to-zero) time to wake.
    """
    from app import models  # noqa: F401 - register tables with Base.metadata

    max_attempts = 5 if _DATABASE_URL else 1
    for attempt in range(max_attempts):
        try:
            Base.metadata.create_all(bind=engine)
            _migrate_add_official_attempts_count()
            from app.seed import run_seed

            db = SessionLocal()
            try:
                run_seed(db)
            finally:
                db.close()
            return
        except Exception as e:
            if attempt < max_attempts - 1 and _DATABASE_URL:
                time.sleep(2 * (attempt + 1))  # 2s, 4s, 6s, 8s
            else:
                raise


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
