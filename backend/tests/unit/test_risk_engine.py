"""Unit tests for Engine 3: Multi-Test Disease Risk Engine."""
import pytest
from app.engines.risk.engine import MultiTestRiskEngine
from app.engines.risk.models import RiskTier

@pytest.fixture
def engine():
    return MultiTestRiskEngine()

def test_normal_patient_low_risk(engine):
    vals = {"Fasting Blood Glucose": 88.0, "HbA1c": 5.2, "Postprandial Blood Glucose": 110.0}
    flags = {"Fasting Blood Glucose": False, "HbA1c": False, "Postprandial Blood Glucose": False}
    out = engine.analyze(vals, flags)
    assert out.overall_health_risk_index == 0.0
    assert out.risk_tier == RiskTier.LOW

def test_metabolic_syndrome_flag(engine):
    # All metabolic features abnormal
    vals = {"Fasting Blood Glucose": 165.0, "HbA1c": 8.8, "Postprandial Blood Glucose": 230.0}
    flags = {"Fasting Blood Glucose": True, "HbA1c": True, "Postprandial Blood Glucose": True}
    out = engine.analyze(vals, flags)
    metabolic_res = next(c for c in out.risk_category_results if c.risk_category_id == "METABOLIC_RISK")
    assert metabolic_res.is_flagged is True
    assert metabolic_res.normalized_score == 1.0
    assert out.overall_health_risk_index > 0.2

def test_severity_weight_scaling(engine):
    vals = {"Serum Creatinine": 2.2, "BUN": 35.0, "eGFR": 38.0}
    flags = {"Serum Creatinine": True, "BUN": True, "eGFR": True}
    out = engine.analyze(vals, flags)
    renal = next(c for c in out.risk_category_results if c.risk_category_id == "RENAL_RISK")
    assert renal.is_flagged is True
    assert renal.severity_weighted_score == renal.normalized_score * renal.severity_weight
