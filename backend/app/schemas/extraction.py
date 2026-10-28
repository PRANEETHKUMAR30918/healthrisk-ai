"""Biomarker extraction review schemas."""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ExtractedBiomarkerItem(BaseModel):
    id: uuid.UUID
    biomarker_name_raw: str
    biomarker_name_canonical: Optional[str]
    numeric_value: Optional[float]
    unit: Optional[str]
    ref_low_extracted: Optional[float]
    ref_high_extracted: Optional[float]
    abnormal_flag: Optional[bool]
    confidence_score: float
    is_corrected: bool
    corrected_value: Optional[float]
    corrected_unit: Optional[str]
    source_location: Optional[str]
    extraction_status: str

    model_config = ConfigDict(from_attributes=True)

class ExtractionReviewResponse(BaseModel):
    report_id: uuid.UUID
    processing_status: str
    extraction_method: Optional[str]
    overall_confidence: float
    biomarkers: list[ExtractedBiomarkerItem]

class BiomarkerCorrectionRequest(BaseModel):
    corrected_value: float
    corrected_unit: Optional[str] = None
