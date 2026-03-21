"""
4–8 ft Performance Drill scoring.
made_count / 20 * 100 = percentage (fixed 20-attempt drill per product guide).
"""

from typing import Any

DEFAULT_TOTAL_PUTTS = 20


def percentage_score(
    attempts: list[dict[str, Any]], total_putts: int = DEFAULT_TOTAL_PUTTS
) -> tuple[int, int, float]:
    """
    Return (made_count, total_recorded, percentage).
    Percentage = made_count / total_putts * 100 (denominator is fixed drill size, not recorded).
    Attempt with is_holed_first_putt=True or result_type='make' counts as made.
    """
    made = 0
    for a in attempts:
        holed = a.get("is_holed_first_putt") is True or a.get("result_type") == "make"
        if holed:
            made += 1
    total_recorded = len(attempts)
    pct = (made / total_putts * 100) if total_putts else 0.0
    return made, total_recorded, round(pct, 1)
