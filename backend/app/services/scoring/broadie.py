"""
Broadie drill scoring: base points, average mode, completion mode.

Base scoring:
  +2 if first putt holed
  0  if 2 putts and first putt not short
  -1 if 2 putts and first putt short
  -3 if 3+ putts
"""

from typing import Optional

BROADIE_TARGET_BY_DISTANCE_FT = {5: 15, 10: 10, 15: 5}


def broadie_points(
    *,
    is_holed_first_putt: bool,
    is_first_putt_short: Optional[bool],
    putts_to_hole_out: int,
) -> int:
    """
    Return points for a single Broadie attempt.
    Pure function.
    """
    if is_holed_first_putt:
        return 2
    if putts_to_hole_out >= 3:
        return -3
    if putts_to_hole_out == 2:
        return -1 if is_first_putt_short else 0
    return 0


def broadie_average_total(points: list[float]) -> float:
    """Sum of points for average mode. Session ends after 10 attempts."""
    return sum(p for p in points if p is not None)


def broadie_completion_attempts_required(
    points: list[float],
    target: int,
    distance_ft: int,
) -> Optional[int]:
    """
    Return number of attempts needed to reach target, or None if not yet reached.
    Targets: 5ft=15, 10ft=10, 15ft=5.
    """
    t = BROADIE_TARGET_BY_DISTANCE_FT.get(distance_ft)
    if t is None:
        t = target
    running = 0.0
    for i, p in enumerate(points):
        if p is not None:
            running += p
        if running >= t:
            return i + 1
    return None
