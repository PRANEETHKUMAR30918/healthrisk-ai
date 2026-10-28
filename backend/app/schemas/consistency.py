"""Engine 2: Physiological Consistency schemas."""
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ConsistencyRuleResultItem(BaseModel):
    rule_id: str
    biomarker_a_name: str
    biomarker_b_name: str
    observed_a: Optional[float]
    observed_b: Optional[float]
    expected_relationship: str
    is_consistent: Optional[bool]
    status: str
    explanation: str

    model_config = ConfigDict(from_attributes=True)

class ConsistencyResponse(BaseModel):
    report_id: uuid.UUID
    consistency_score: float
    reliability_score: float
    avg_extraction_confidence: float
    baseline_stability: float
    rule_results: list[ConsistencyRuleResultItem]
    disclaimer: str
