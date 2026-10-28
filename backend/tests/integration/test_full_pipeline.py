"""Integration tests verifying full pipeline progression."""
import pytest
from app.engines.baseline.engine import PersonalizedBaselineEngine
from app.engines.baseline.models import BaselineInput
from app.engines.consistency.engine import PhysiologicalConsistencyEngine
from app.engines.risk.engine import MultiTestRiskEngine

def test_end_to_end_three_engine_workflow():
    baseline_eng = PersonalizedBaselineEngine()
    consistency_eng = PhysiologicalConsistencyEngine()
    risk_eng = MultiTestRiskEngine()

    current_data = {
        "Hemoglobin": 10.5,
        "RBC": 3.9,
        "MCV": 75.0,
        "Hematocrit": 31.5,
        "Fasting Blood Glucose": 138.0,
        "HbA1c": 7.6
    }
    history = {
        "Hemoglobin": [13.5, 13.2, 12.8, 12.0],
        "Fasting Blood Glucose": [92.0, 95.0, 98.0, 102.0]
    }

    # 1. Baseline analysis
    base_inputs = [
        BaselineInput(
            biomarker_name="Hemoglobin",
            current_value=current_data["Hemoglobin"],
            current_unit="g/dL",
            historical_values=history["Hemoglobin"]
        ),
        BaselineInput(
            biomarker_name="Fasting Blood Glucose",
            current_value=current_data["Fasting Blood Glucose"],
            current_unit="mg/dL",
            historical_values=history["Fasting Blood Glucose"]
        )
    ]
    base_results = baseline_eng.analyze(base_inputs)
    assert len(base_results) == 2
    hb_res = next(b for b in base_results if b.biomarker_name == "Hemoglobin")
    assert hb_res.z_score < -2.0  # Significant personal decline

    # 2. Consistency analysis
    consist_res = consistency_eng.analyze(current_data, avg_extraction_confidence=0.92, baseline_stability=0.88)
    assert consist_res.consistency_score > 0.0
    assert 0.0 <= consist_res.reliability_score <= 1.0

    # 3. Risk analysis
    flags = {
        "Hemoglobin": True,
        "RBC": True,
        "MCV": True,
        "Hematocrit": True,
        "Fasting Blood Glucose": True,
        "HbA1c": True
    }
    z_map = {"Hemoglobin": hb_res.z_score or 0.0}
    risk_res = risk_eng.analyze(current_data, flags, z_map)
    assert risk_res.overall_health_risk_index > 0.25
    flagged_cats = [c.risk_category_id for c in risk_res.risk_category_results if c.is_flagged]
    assert "METABOLIC_RISK" in flagged_cats or "ANEMIA_RISK" in flagged_cats
