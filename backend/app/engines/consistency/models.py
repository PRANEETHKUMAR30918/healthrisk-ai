"""Engine 2 data contracts."""
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum

class ConsistencyStatus(str, Enum):
    CONSISTENT = "CONSISTENT"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    MISSING_DATA = "MISSING_DATA"

@dataclass
class RuleEvaluationResult:
    rule_id: str
    biomarker_a: str
    biomarker_b: str
    observed_a: Optional[float]
    observed_b: Optional[float]
    expected_relationship: str
    status: ConsistencyStatus
    is_consistent: Optional[bool]
    explanation: str
    weight: float = 1.0

@dataclass
class ConsistencyEngineOutput:
    consistency_score: float
    reliability_score: float
    avg_extraction_confidence: float
    baseline_stability: float
    rule_results: list[RuleEvaluationResult] = field(default_factory=list)
    disclaimer: str = (
        "Consistency findings are automated cross-checks designed to identify potential "
        "extraction artifacts or physiological discordance. They do NOT establish a clinical diagnosis."
    )
