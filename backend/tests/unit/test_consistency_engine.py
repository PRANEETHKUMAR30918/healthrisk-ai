"""Unit tests for Engine 2: Physiological Consistency and Reliability Engine."""
import pytest
from app.engines.consistency.engine import PhysiologicalConsistencyEngine
from app.engines.consistency.models import ConsistencyStatus

@pytest.fixture
def engine():
    return PhysiologicalConsistencyEngine()

def test_hb_rbc_consistent_relationship(engine):
    # Hb = 14.0, RBC = 4.8 -> MCH = 140 / 4.8 = 29.1 pg (normal)
    vals = {"Hemoglobin": 14.0, "RBC": 4.8}
    out = engine.analyze(vals, avg_extraction_confidence=0.95, baseline_stability=0.9)
    hb_rbc_rule = next(r for r in out.rule_results if r.rule_id == "RULE_HB_RBC")
    assert hb_rbc_rule.status == ConsistencyStatus.CONSISTENT
    assert out.consistency_score > 0.9

def test_hb_rbc_inconsistent_relationship(engine):
    # Hb = 8.0, RBC = 5.8 -> MCH = 80 / 5.8 = 13.8 pg (discordant)
    vals = {"Hemoglobin": 8.0, "RBC": 5.8}
    out = engine.analyze(vals, avg_extraction_confidence=0.95, baseline_stability=0.9)
    hb_rbc_rule = next(r for r in out.rule_results if r.rule_id == "RULE_HB_RBC")
    assert hb_rbc_rule.status == ConsistencyStatus.REVIEW_REQUIRED

def test_missing_data_does_not_penalize_score(engine):
    # Only Hb provided, RBC missing
    vals = {"Hemoglobin": 14.0}
    out = engine.analyze(vals, avg_extraction_confidence=0.90, baseline_stability=0.85)
    hb_rbc_rule = next(r for r in out.rule_results if r.rule_id == "RULE_HB_RBC")
    assert hb_rbc_rule.status == ConsistencyStatus.MISSING_DATA
    # Consistency score ignores missing rules
    assert out.consistency_score == 1.0

def test_reliability_score_weights(engine):
    # Reliability = 0.4*Consistency + 0.4*Confidence + 0.2*Stability
    out = engine.analyze({}, avg_extraction_confidence=0.80, baseline_stability=0.60)
    # With 0 rules evaluated, consistency = 1.0
    # Expected: 0.4 * 1.0 + 0.4 * 0.80 + 0.2 * 0.60 = 0.4 + 0.32 + 0.12 = 0.84
    assert abs(out.reliability_score - 0.84) < 1e-3
