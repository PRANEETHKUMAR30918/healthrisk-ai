"""Laboratory report schemas."""
import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReportResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    filename: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    report_date: Optional[date]
    lab_name: Optional[str]
    processing_status: str
    extraction_method: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReportListResponse(BaseModel):
    items: list[ReportResponse]
    total: int
