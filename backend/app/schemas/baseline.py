"""Engine 1: Personalized Baseline schemas."""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class BaselineResultItem(BaseModel):
    biomarker_name: str
    current_value: Optional[float]
    current_unit: Optional[str]
    historical_mean: Optional[float]
    historical_std: Optional[float]
    z_score: Optional[float]
    sample_count: int
    deviation_status: str
    data_source: str
    trend_direction: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class BaselineResponse(BaseModel):
    report_id: uuid.UUID
    patient_id: uuid.UUID
    results: list[BaselineResultItem]
    overall_stability: float
    timestamp: datetime
