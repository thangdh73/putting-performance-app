"""
Seed data for drills and default user.

BENCHMARK_JSON schema (per drill type):
----------------------------------------
broadie_average / broadie_completion (Broadie 5/10/15 ft):
  {
    "type": "broadie",
    "distance_ft": 5 | 10 | 15,
    "average_mode": { "best": int, "average": int, "worst": int },
    "completion_mode": { "target": int, "best": int, "average": int, "worst": int }
  }

footage (100 ft drill):
  { "type": "footage", "unit": "ft", "reference_ft": 100, "description": str }

percentage (4–8 ft drill):
  { "type": "percentage", "total_putts": 20, "benchmarks": [ { "label": str, "made": int } ] }

strokes_gained_placeholder (9/18 hole SG drills):
  { "type": "strokes_gained_placeholder", "holes": 9 | 18, "description": str }
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Drill, User

DEFAULT_USER_NAME = "Golfer"

DRILLS = [
    {
        "code": "broadie_5ft",
        "name": "Broadie 5 ft Drill",
        "category": "broadie",
        "description": "10 putts from 5 ft. Score: +2 make, 0 2-putt (not short), -1 2-putt (short), -3 3-putt.",
        "instructions_markdown": "Put 10 balls from 5 ft. Hole out every putt. Sum points for total score.",
        "benchmark_json": {
            "type": "broadie",
            "distance_ft": 5,
            "average_mode": {"best": 16, "average": 15, "worst": 14},
            "completion_mode": {"target": 15, "best": 10, "average": 10, "worst": 11},
        },
        "is_active": True,
    },
    {
        "code": "broadie_10ft",
        "name": "Broadie 10 ft Drill",
        "category": "broadie",
        "description": "10 putts from 10 ft. Same scoring.",
        "instructions_markdown": "Put 10 balls from 10 ft. Hole out every putt. Sum points for total score.",
        "benchmark_json": {
            "type": "broadie",
            "distance_ft": 10,
            "average_mode": {"best": 8, "average": 7, "worst": 6},
            "completion_mode": {"target": 10, "best": 11, "average": 14, "worst": 17},
        },
        "is_active": True,
    },
    {
        "code": "broadie_15ft",
        "name": "Broadie 15 ft Drill",
        "category": "broadie",
        "description": "10 putts from 15 ft. Same scoring.",
        "instructions_markdown": "Put 10 balls from 15 ft. Hole out every putt. Sum points for total score.",
        "benchmark_json": {
            "type": "broadie",
            "distance_ft": 15,
            "average_mode": {"best": 4, "average": 3, "worst": 1},
            "completion_mode": {"target": 5, "best": 11, "average": 14, "worst": 18},
        },
        "is_active": True,
    },
    {
        "code": "100ft_performance",
        "name": "100 ft Performance Drill",
        "category": "footage",
        "description": "20 putts: 5, 10, 15, 20 ft around 5 holes. Score = total holed footage.",
        "instructions_markdown": "Set up 5, 10, 15, 20 ft at each of 5 holes. 20 putts total. Add feet for each make.",
        "benchmark_json": {
            "type": "footage",
            "unit": "ft",
            "reference_ft": 100,
            "description": "~PGA Tour winner level",
        },
        "is_active": True,
    },
    {
        "code": "4_8ft_performance",
        "name": "4–8 ft Performance Drill",
        "category": "percentage",
        "description": "20 putts: 4–8 ft around 4 holes. Score = made_count / 20 * 100.",
        "instructions_markdown": "Set up 4, 5, 6, 7, 8 ft at each of 4 holes. 20 putts total. Track makes.",
        "benchmark_json": {
            "type": "percentage",
            "total_putts": 20,
            "benchmarks": [
                {"label": "75%", "made": 15},
                {"label": "65%", "made": 13},
            ],
        },
        "is_active": True,
    },
    {
        "code": "9hole_sg",
        "name": "9-Hole Strokes Gained Drill",
        "category": "strokes_gained_placeholder",
        "description": "Record distance and putts per hole for 9 holes. MVP: store and aggregate only.",
        "instructions_markdown": "Play 9 holes. Record distance and putts for each hole. Full SG maths in future.",
        "benchmark_json": {
            "type": "strokes_gained_placeholder",
            "holes": 9,
            "description": "MVP: store distance and putts; full strokes gained later",
        },
        "is_active": True,
    },
    {
        "code": "18hole_sg",
        "name": "18-Hole Strokes Gained Drill",
        "category": "strokes_gained_placeholder",
        "description": "Record distance and putts per hole for 18 holes. MVP: store and aggregate only.",
        "instructions_markdown": "Play 18 holes. Record distance and putts for each hole. Full SG maths in future.",
        "benchmark_json": {
            "type": "strokes_gained_placeholder",
            "holes": 18,
            "description": "MVP: store distance and putts; full strokes gained later",
        },
        "is_active": True,
    },
]


def seed_default_user(db: Session) -> User | None:
    """Create default user only if no users exist at all. Returns the default user or None."""
    if db.query(User).count() > 0:
        return None
    user = User(name=DEFAULT_USER_NAME)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_drills(db: Session) -> None:
    """Insert drill definitions if none exist. Idempotent by code."""
    for d in DRILLS:
        existing = db.query(Drill).filter(Drill.code == d["code"]).first()
        if existing:
            continue
        drill = Drill(**d)
        db.add(drill)
    db.commit()


def run_seed(db: Session) -> None:
    """Run all seed logic. Call after tables exist."""
    seed_default_user(db)
    seed_drills(db)
