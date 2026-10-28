"""Patient-Friendly Health Summary schemas."""
import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict

class SummarySectionItem(BaseModel):
    title: str
    content: str

class HealthSummaryResponse(BaseModel):
    report_id: uuid.UUID
    overall_risk_index: Optional[float]
    risk_tier: Optional[str]
    summary_sections: list[SummarySectionItem]
    patient_friendly_text: str
    key_findings: list[str]
    recommendations: list[str]
    disclaimer: str
    generated_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
