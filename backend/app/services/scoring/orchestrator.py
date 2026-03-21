"""
Orchestrator: single entrypoint for session total calculation.
Dispatches to drill-specific scorers based on drill category.
"""

from typing import Any, Optional

from app.services.scoring import broadie, footage, percentage
from app.services.scoring.broadie import BROADIE_TARGET_BY_DISTANCE_FT
from app.services.scoring.sg_placeholder import sg_aggregates


def _attempt_to_dict(a: Any) -> dict[str, Any]:
    """Normalise ORM or dict attempt to plain dict."""
    if hasattr(a, "__dict__") and not isinstance(a, dict):
        return {k: getattr(a, k, None) for k in ("distance_ft", "is_holed_first_putt", "is_first_putt_short", "putts_to_hole_out", "points_awarded", "result_type")}
    return dict(a) if a else {}


def calculate_session_totals(
    drill_category: str,
    drill_code: str,
    benchmark_json: Optional[dict],
    attempts: list[Any],
    scoring_mode: Optional[str] = None,
) -> dict[str, Any]:
    """
    Compute session totals from attempts. Returns dict to update Session.
    Keys: total_score, attempts_required, made_count, total_attempts, percentage_score, benchmark_label
    """
    result: dict[str, Any] = {
        "total_score": None,
        "attempts_required": None,
        "made_count": None,
        "total_attempts": None,
        "percentage_score": None,
        "benchmark_label": None,
    }
    attempts_list = [_attempt_to_dict(a) for a in attempts]

    if drill_category == "broadie":
        mode = (scoring_mode or "average").lower()
        distance_ft = 5
        if benchmark_json and "distance_ft" in benchmark_json:
            distance_ft = int(benchmark_json["distance_ft"])
        target = BROADIE_TARGET_BY_DISTANCE_FT.get(distance_ft, 15)

        points: list[float] = []
        for a in attempts_list:
            pts = a.get("points_awarded")
            if pts is not None:
                points.append(pts)
            else:
                p = broadie.broadie_points(
                    is_holed_first_putt=a.get("is_holed_first_putt") is True,
                    is_first_putt_short=a.get("is_first_putt_short"),
                    putts_to_hole_out=int(a.get("putts_to_hole_out") or 0),
                )
                points.append(float(p))

        if mode == "completion":
            n = broadie.broadie_completion_attempts_required(points, target, distance_ft)
            result["attempts_required"] = n
            result["total_score"] = broadie.broadie_average_total(points) if points else None
        else:
            result["total_score"] = broadie.broadie_average_total(points) if points else None
            result["total_attempts"] = len(points)

    elif drill_category == "footage":
        total = footage.footage_total(attempts_list)
        result["total_score"] = total
        result["total_attempts"] = len(attempts_list)

    elif drill_category == "percentage":
        total_putts = 20
        if benchmark_json and "total_putts" in benchmark_json:
            total_putts = int(benchmark_json["total_putts"])
        made, total_recorded, pct = percentage.percentage_score(
            attempts_list, total_putts=total_putts
        )
        result["made_count"] = made
        result["total_attempts"] = total_recorded
        result["percentage_score"] = pct

    elif drill_category == "strokes_gained_placeholder":
        agg = sg_aggregates(attempts_list)
        result["total_score"] = float(agg["total_putts"])
        result["total_attempts"] = agg["holes"]
        result["benchmark_label"] = f"Avg {agg['avg_distance_ft']} ft"

    else:
        # Unknown drill category: return all-None. Session totals stay unset.
        # Supported: broadie, footage, percentage, strokes_gained_placeholder
        pass

    return result
