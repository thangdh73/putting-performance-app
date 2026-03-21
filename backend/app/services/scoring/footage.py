"""
100 ft Performance Drill scoring.
Each holed putt adds its distance_ft to total. Final score = total holed footage.
"""

from typing import Any


def footage_total(attempts: list[dict[str, Any]]) -> float:
    """
    Sum distance_ft for attempts where the putt was holed.
    attempts: list of dicts with distance_ft and is_holed_first_putt (or result_type).
    """
    total = 0.0
    for a in attempts:
        dist = a.get("distance_ft")
        holed = a.get("is_holed_first_putt") is True or a.get("result_type") == "make"
        if holed and dist is not None:
            total += float(dist)
    return total
