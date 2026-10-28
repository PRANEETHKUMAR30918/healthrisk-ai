"""Laboratory report model."""
import uuid
from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Text, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class LaboratoryReport(Base):
    __tablename__ = "laboratory_reports"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_type: Mapped[str] = mapped_column(String(16), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    report_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    lab_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    processing_status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    extraction_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="reports")
    extraction_results: Mapped[list["ExtractionResult"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    baseline_results: Mapped[list["BaselineResult"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    consistency_results: Mapped[list["ConsistencyResult"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    risk_results: Mapped[list["RiskResult"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    health_summary: Mapped[Optional["HealthSummary"]] = relationship(back_populates="report", uselist=False, cascade="all, delete-orphan")
