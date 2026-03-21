"""Unit tests for scoring engine."""

from app.services.scoring.broadie import (
    broadie_average_total,
    broadie_completion_attempts_required,
    broadie_points,
)
from app.services.scoring.footage import footage_total
from app.services.scoring.percentage import percentage_score
from app.services.scoring.sg_placeholder import sg_aggregates
from app.services.scoring.orchestrator import calculate_session_totals


# --- Broadie base scoring ---


def test_broadie_points_holed():
    assert broadie_points(is_holed_first_putt=True, is_first_putt_short=None, putts_to_hole_out=1) == 2


def test_broadie_points_two_putt_not_short():
    assert broadie_points(is_holed_first_putt=False, is_first_putt_short=False, putts_to_hole_out=2) == 0


def test_broadie_points_two_putt_short():
    assert broadie_points(is_holed_first_putt=False, is_first_putt_short=True, putts_to_hole_out=2) == -1


def test_broadie_points_three_putt():
    assert broadie_points(is_holed_first_putt=False, is_first_putt_short=None, putts_to_hole_out=3) == -3


def test_broadie_points_four_putt():
    assert broadie_points(is_holed_first_putt=False, is_first_putt_short=True, putts_to_hole_out=4) == -3


# --- Broadie average mode ---


def test_broadie_average_total():
    assert broadie_average_total([2, 2, 0, -1, -3, 2, 0, 0, 2, 2]) == 6


def test_broadie_average_total_empty():
    assert broadie_average_total([]) == 0


# --- Broadie completion mode ---


def test_broadie_completion_reached_in_10():
    points = [1] * 10
    assert broadie_completion_attempts_required(points, 10, 10) == 10


def test_broadie_completion_reached_in_5():
    points = [2, 2, 2, 2, 2]
    assert broadie_completion_attempts_required(points, 10, 10) == 5


def test_broadie_completion_not_reached():
    points = [0, 0, 0]
    assert broadie_completion_attempts_required(points, 15, 5) is None


def test_broadie_completion_10ft_target():
    points = [2] * 10
    assert broadie_completion_attempts_required(points, 10, 10) == 5


def test_broadie_completion_15ft_target():
    points = [2, 2, 1]
    assert broadie_completion_attempts_required(points, 5, 15) == 3


# --- 100 ft drill ---


def test_footage_total():
    attempts = [
        {"distance_ft": 5, "is_holed_first_putt": True},
        {"distance_ft": 10, "is_holed_first_putt": False},
        {"distance_ft": 15, "is_holed_first_putt": True},
        {"distance_ft": 20, "result_type": "make"},
    ]
    assert footage_total(attempts) == 40.0


def test_footage_total_result_type_make():
    attempts = [{"distance_ft": 5, "result_type": "make"}]
    assert footage_total(attempts) == 5.0


def test_footage_total_empty():
    assert footage_total([]) == 0.0


def test_footage_total_100_benchmark():
    attempts = (
        [
            {"distance_ft": 5, "is_holed_first_putt": True},
            {"distance_ft": 10, "is_holed_first_putt": True},
            {"distance_ft": 15, "is_holed_first_putt": True},
            {"distance_ft": 20, "is_holed_first_putt": True},
        ]
        * 2
    )
    assert footage_total(attempts) == 100.0


# --- 4–8 ft drill ---


def test_percentage_score():
    """2 made out of 4 recorded; percentage uses fixed 20-attempt denominator."""
    attempts = [
        {"is_holed_first_putt": True},
        {"is_holed_first_putt": False},
        {"result_type": "make"},
        {"result_type": "miss"},
    ]
    made, total, pct = percentage_score(attempts)
    assert made == 2
    assert total == 4
    assert pct == 10.0  # 2/20*100


def test_percentage_score_all_made():
    attempts = [{"is_holed_first_putt": True}] * 20
    made, total, pct = percentage_score(attempts)
    assert made == 20
    assert total == 20
    assert pct == 100.0


def test_percentage_score_75():
    """15 made out of 20; percentage = 15/20*100 = 75%."""
    attempts = [{"is_holed_first_putt": True}] * 15 + [{"is_holed_first_putt": False}] * 5
    made, total, pct = percentage_score(attempts)
    assert made == 15
    assert total == 20
    assert pct == 75.0


def test_percentage_score_65():
    attempts = [{"is_holed_first_putt": True}] * 13 + [{"is_holed_first_putt": False}] * 7
    made, total, pct = percentage_score(attempts)
    assert made == 13
    assert total == 20
    assert pct == 65.0


def test_percentage_score_partial_session():
    """15 made of 15 recorded (partial session); percentage = 75% (denominator always 20)."""
    attempts = [{"is_holed_first_putt": True}] * 15
    made, total, pct = percentage_score(attempts)
    assert made == 15
    assert total == 15
    assert pct == 75.0  # 15/20*100, not 15/15*100


# --- SG placeholder ---


def test_sg_aggregates():
    attempts = [
        {"distance_ft": 20, "putts_to_hole_out": 2},
        {"distance_ft": 30, "putts_to_hole_out": 1},
        {"distance_ft": 10, "putts_to_hole_out": 3},
    ]
    agg = sg_aggregates(attempts)
    assert agg["total_putts"] == 6
    assert agg["avg_distance_ft"] == 20.0
    assert agg["holes"] == 3


def test_sg_aggregates_empty():
    agg = sg_aggregates([])
    assert agg["total_putts"] == 0
    assert agg["avg_distance_ft"] == 0.0
    assert agg["holes"] == 0


# --- Orchestrator ---


def test_orchestrator_broadie_average():
    attempts = [
        {"points_awarded": 2},
        {"points_awarded": 0},
        {"points_awarded": -1},
    ]
    totals = calculate_session_totals(
        drill_category="broadie",
        drill_code="broadie_5ft",
        benchmark_json={"distance_ft": 5},
        attempts=attempts,
        scoring_mode="average",
    )
    assert totals["total_score"] == 1.0
    assert totals["total_attempts"] == 3


def test_orchestrator_broadie_computes_points_from_attempts():
    attempts = [
        {"is_holed_first_putt": True, "putts_to_hole_out": 1},
        {"is_holed_first_putt": False, "is_first_putt_short": False, "putts_to_hole_out": 2},
        {"is_holed_first_putt": False, "is_first_putt_short": True, "putts_to_hole_out": 2},
    ]
    totals = calculate_session_totals(
        drill_category="broadie",
        drill_code="broadie_5ft",
        benchmark_json={"distance_ft": 5},
        attempts=attempts,
        scoring_mode="average",
    )
    assert totals["total_score"] == 1.0


def test_orchestrator_broadie_completion():
    attempts = [{"points_awarded": 2}] * 8
    totals = calculate_session_totals(
        drill_category="broadie",
        drill_code="broadie_5ft",
        benchmark_json={"distance_ft": 5, "completion_mode": {"target": 15}},
        attempts=attempts,
        scoring_mode="completion",
    )
    assert totals["attempts_required"] == 8
    assert totals["total_score"] == 16.0


def test_orchestrator_footage():
    attempts = [
        {"distance_ft": 5, "is_holed_first_putt": True},
        {"distance_ft": 10, "is_holed_first_putt": True},
    ]
    totals = calculate_session_totals(
        drill_category="footage",
        drill_code="100ft_performance",
        benchmark_json={},
        attempts=attempts,
    )
    assert totals["total_score"] == 15.0
    assert totals["total_attempts"] == 2


def test_orchestrator_percentage():
    """15 made of 20; percentage = 75% (uses total_putts from benchmark or default 20)."""
    attempts = [{"is_holed_first_putt": True}] * 15 + [{"is_holed_first_putt": False}] * 5
    totals = calculate_session_totals(
        drill_category="percentage",
        drill_code="4_8ft_performance",
        benchmark_json={"total_putts": 20},
        attempts=attempts,
    )
    assert totals["made_count"] == 15
    assert totals["total_attempts"] == 20
    assert totals["percentage_score"] == 75.0


def test_orchestrator_sg_placeholder():
    attempts = [
        {"distance_ft": 25, "putts_to_hole_out": 2},
        {"distance_ft": 15, "putts_to_hole_out": 1},
    ]
    totals = calculate_session_totals(
        drill_category="strokes_gained_placeholder",
        drill_code="9hole_sg",
        benchmark_json={},
        attempts=attempts,
    )
    assert totals["total_score"] == 3.0
    assert totals["total_attempts"] == 2
    assert "Avg" in (totals["benchmark_label"] or "")


def test_orchestrator_accepts_orm_like_objects():
    class FakeAttempt:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    attempts = [
        FakeAttempt(distance_ft=5, is_holed_first_putt=True),
        FakeAttempt(distance_ft=10, is_holed_first_putt=True),
    ]
    totals = calculate_session_totals(
        drill_category="footage",
        drill_code="100ft_performance",
        benchmark_json={},
        attempts=attempts,
    )
    assert totals["total_score"] == 15.0


def test_broadie_two_putt_short_unknown_treated_as_not_short():
    assert broadie_points(is_holed_first_putt=False, is_first_putt_short=None, putts_to_hole_out=2) == 0
