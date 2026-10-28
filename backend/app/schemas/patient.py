"""Patient management schemas."""
import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator

class PatientCreate(BaseModel):
    patient_code: str = Field(..., min_length=2, max_length=64)
    date_of_birth: Optional[date] = None
    sex: Optional[str] = Field(None, max_length=10)

    @field_validator("sex")
    def validate_sex(cls, v):
        if v is not None and v.upper() not in ("M", "F", "OTHER"):
            raise ValueError("Sex must be 'M', 'F', or 'OTHER'")
        return v.upper() if v else None

class PatientUpdate(BaseModel):
    patient_code: Optional[str] = Field(None, min_length=2, max_length=64)
    date_of_birth: Optional[date] = None
    sex: Optional[str] = Field(None, max_length=10)

class PatientResponse(BaseModel):
    id: uuid.UUID
    patient_code: str
    date_of_birth: Optional[date]
    sex: Optional[str]
    user_id: uuid.UUID
    created_at: datetime
    report_count: int = 0
    latest_report_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)
