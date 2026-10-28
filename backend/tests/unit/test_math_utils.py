"""Unit tests for mathematical and statistical calculation utilities."""
import pytest
from app.utils.math_utils import safe_mean, safe_std, safe_zscore, normalize_score, clamp, trend_direction

def test_safe_mean_standard():
    assert safe_mean([10.0, 20.0, 30.0]) == 20.0

def test_safe_mean_empty():
    assert safe_mean([]) == 0.0

def test_safe_std_standard():
    vals = [10.0, 10.0, 20.0, 20.0]
    # std of [10, 10, 20, 20] is 5.0
    assert abs(safe_std(vals) - 5.0) < 1e-5

def test_safe_std_single_value():
    assert safe_std([15.0]) == 0.0

def test_safe_zscore_calculation():
    # Mean 14.0, std 1.0, current 16.0 -> Z = +2.0
    z = safe_zscore(16.0, 14.0, 1.0)
    assert z == 2.0

def test_safe_zscore_zero_std_handling():
    # Invariant historical data where std == 0.0 must not cause ZeroDivisionError
    assert safe_zscore(14.0, 14.0, 0.0) is None

def test_normalize_score():
    assert normalize_score(5.0, 10.0) == 0.5
    assert normalize_score(15.0, 10.0) == 1.0
    assert normalize_score(0.0, 0.0) == 0.0

def test_clamp():
    assert clamp(1.2, 0.0, 1.0) == 1.0
    assert clamp(-0.5, 0.0, 1.0) == 0.0
    assert clamp(0.75, 0.0, 1.0) == 0.75

def test_trend_direction():
    assert trend_direction([10.0, 12.0, 14.0, 16.0]) == "INCREASING"
    assert trend_direction([16.0, 14.0, 12.0, 10.0]) == "DECREASING"
    assert trend_direction([12.0, 12.1, 11.9, 12.0]) == "STABLE"
    assert trend_direction([10.0]) == "INSUFFICIENT_DATA"
