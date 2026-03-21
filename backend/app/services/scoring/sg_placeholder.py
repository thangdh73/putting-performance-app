"""
9-hole and 18-hole Strokes Gained placeholder.
Store per-hole distance and putts; return aggregate totals only.
No full strokes gained maths.
"""

from typing import Any


def sg_aggregates(attempts: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Return aggregate totals: total_putts, avg_distance_ft.
    Each attempt represents one hole with distance_ft and putts_to_hole_out.
    """
    total_putts = 0
    total_dist = 0.0
    dist_count = 0
    for a in attempts:
        putts = a.get("putts_to_hole_out")
        if putts is not None:
            total_putts += int(putts)
        dist = a.get("distance_ft")
        if dist is not None:
            total_dist += float(dist)
            dist_count += 1
    avg_dist = round(total_dist / dist_count, 1) if dist_count else 0.0
    return {"total_putts": total_putts, "avg_distance_ft": avg_dist, "holes": len(attempts)}
