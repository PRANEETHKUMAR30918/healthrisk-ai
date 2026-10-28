"""Unit tests for Engine 1: Personalized Baseline Deviation Engine."""
import pytest
from app.engines.baseline.engine import PersonalizedBaselineEngine
from app.engines.baseline.models import BaselineInput, DeviationStatus

@pytest.fixture
def engine():
    return PersonalizedBaselineEngine()

def test_insufficient_history_guard(engine):
    # Only 2 historical records, below MIN_HISTORY_COUNT (3)
    inp = BaselineInput(
        biomarker_name="Hemoglobin",
        current_value=12.2,
        current_unit="g/dL",
        historical_values=[13.5, 13.2]
    )
    res = engine.analyze([inp])
    assert len(res) == 1
    assert res[0].deviation_status == DeviationStatus.INSUFFICIENT_HISTORY
    assert res[0].data_source == "POPULATION_REFERENCE"
    assert res[0].z_score is None

def test_within_baseline(engine):
    # Mean 14.0, std 0.5, current 14.1 -> Z approx +0.2 (Within baseline)
    inp = BaselineInput(
        biomarker_name="Hemoglobin",
        current_value=14.1,
        current_unit="g/dL",
        historical_values=[13.8, 14.2, 14.0, 13.9]
    )
    res = engine.analyze([inp])
    assert res[0].deviation_status == DeviationStatus.WITHIN_BASELINE
    assert abs(res[0].z_score) < 1.0
    assert res[0].data_source == "PERSONAL_BASELINE"

def test_significant_deviation(engine):
    # Historical mean 14.5, std ~0.3, current 12.0 -> Z approx -8.3 (Significant)
    inp = BaselineInput(
        biomarker_name="Hemoglobin",
        current_value=12.0,
        current_unit="g/dL",
        historical_values=[14.4, 14.6, 14.5, 14.5]
    )
    res = engine.analyze([inp])
    assert res[0].deviation_status == DeviationStatus.SIGNIFICANT_DEVIATION
    assert res[0].z_score < -3.0

def test_zero_variance_stable_baseline(engine):
    # Exactly identical historical readings
    inp = BaselineInput(
        biomarker_name="Glucose",
        current_value=90.0,
        current_unit="mg/dL",
        historical_values=[90.0, 90.0, 90.0, 90.0]
    )
    res = engine.analyze([inp])
    assert res[0].deviation_status == DeviationStatus.STABLE_BASELINE
    assert res[0].historical_std == 0.0
    assert res[0].z_score is None

def test_zero_variance_shift(engine):
    inp = BaselineInput(
        biomarker_name="Glucose",
        current_value=125.0,
        current_unit="mg/dL",
        historical_values=[90.0, 90.0, 90.0, 90.0]
    )
    res = engine.analyze([inp])
    assert res[0].deviation_status == DeviationStatus.MODERATE_DEVIATION
    assert res[0].z_score is None
