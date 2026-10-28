"""Engine 3 data contracts."""
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum

class RiskTier(str, Enum):
    LOW = "Low risk indicator"
    MILD = "Mild risk indicator — monitoring recommended"
    MODERATE = "Moderate risk indicator — consider consultation"
    ELEVATED = "Elevated risk indicator — clinical review recommended"

@dataclass
class FactorScore:
    biomarker: str
    value: Optional[float]
    abnormal: Optional[bool]
    weight: float
    feature_score: float

@dataclass
class RiskCategoryResult:
    risk_category_id: str
    risk_category_name: str
    normalized_score: float
    severity_weight: float
    severity_weighted_score: float
    is_flagged: bool
    contributing_factors: list[FactorScore] = field(default_factory=list)
    explanation: str = ""

@dataclass
class RiskEngineOutput:
    overall_health_risk_index: float
    risk_tier: RiskTier
    risk_category_results: list[RiskCategoryResult] = field(default_factory=list)
    disclaimer: str = (
        "This multi-test risk assessment is a clinical decision-support and research indicator. "
        "It does NOT provide a definitive diagnosis or replace clinical judgment by a licensed physician."
    )
