"""Engine 3: Multi-Test Risk schemas."""
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ContributingFactorItem(BaseModel):
    biomarker: str
    value: Optional[float]
    abnormal: Optional[bool]
    weight: float
    feature_score: float = 0.0

class RiskCategoryResultItem(BaseModel):
    risk_category_id: str
    risk_category_name: str
    normalized_score: float
    severity_weight: float
    severity_weighted_score: float
    is_flagged: bool
    contributing_factors: list[ContributingFactorItem]
    explanation: str

    model_config = ConfigDict(from_attributes=True)

class RiskResponse(BaseModel):
    report_id: uuid.UUID
    overall_health_risk_index: float
    risk_tier: str
    risk_category_results: list[RiskCategoryResultItem]
    disclaimer: str
