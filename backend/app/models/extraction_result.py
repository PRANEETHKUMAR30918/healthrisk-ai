"""Biomarker extraction results model."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Boolean, ForeignKey, DateTime, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ExtractionResult(Base):
    __tablename__ = "extraction_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("laboratory_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    biomarker_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("biomarkers.id", ondelete="SET NULL"), nullable=True)
    biomarker_name_raw: Mapped[str] = mapped_column(String(128), nullable=False)
    biomarker_name_canonical: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    numeric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    ref_low_extracted: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ref_high_extracted: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    abnormal_flag: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_corrected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    corrected_by: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    corrected_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    corrected_unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    source_location: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    extraction_status: Mapped[str] = mapped_column(String(32), default="EXTRACTED", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    report: Mapped["LaboratoryReport"] = relationship(back_populates="extraction_results")
