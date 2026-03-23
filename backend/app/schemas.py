"""Pydantic schemas for request/response."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    name: str = "Golfer"
    preferred_scoring_mode: Optional[str] = None


class UserCreate(UserBase):
    name: str = Field(..., min_length=1)


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DrillBase(BaseModel):
    code: str
    name: str
    category: str
    description: Optional[str] = None
    instructions_markdown: Optional[str] = None
    benchmark_json: Optional[dict[str, Any]] = None
    is_active: bool = True


class DrillRead(DrillBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionBase(BaseModel):
    user_id: int
    drill_id: int
    session_date: datetime
    scoring_mode: Optional[str] = None
    notes: Optional[str] = None


class SessionCreate(SessionBase):
    pass


class SessionRead(SessionBase):
    id: int
    total_score: Optional[float] = None
    attempts_required: Optional[int] = None
    official_attempts_count: Optional[int] = None
    made_count: Optional[int] = None
    total_attempts: Optional[int] = None
    percentage_score: Optional[float] = None
    benchmark_label: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionReadWithDrill(SessionRead):
    drill: Optional["DrillRead"] = None


class AttemptBase(BaseModel):
    attempt_number: int
    hole_group: Optional[int] = None
    distance_ft: Optional[float] = None
    result_type: Optional[str] = None
    is_holed_first_putt: Optional[bool] = None
    is_first_putt_short: Optional[bool] = None
    putts_to_hole_out: Optional[int] = None
    points_awarded: Optional[float] = None


class AttemptCreate(AttemptBase):
    pass


class AttemptRead(AttemptBase):
    id: int
    session_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


SessionReadWithDrill.model_rebuild()
