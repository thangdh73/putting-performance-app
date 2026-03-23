"""
FastAPI application.
CORS and proxy config for Vite. DB init and seed on startup.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import drills, sessions, users

# CORS: localhost for dev; CORS_ORIGINS env for production (comma-separated)
_DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]


def _cors_origins() -> list[str]:
    env_origins = os.environ.get("CORS_ORIGINS", "").strip()
    if not env_origins:
        return _DEFAULT_ORIGINS
    return [o.strip() for o in env_origins.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    init_db()
    yield


app = FastAPI(
    title="Putting Performance API",
    version="0.1.0",
    description="MVP backend — scoring engine in Phase 3.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(drills.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Putting Performance API", "docs": "/docs"}


@app.get("/api/health")
def health():
    db_type = "postgresql" if os.environ.get("DATABASE_URL") else "sqlite"
    return {"status": "ok", "service": "putting-performance-api", "database": db_type}
