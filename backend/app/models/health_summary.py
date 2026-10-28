"""Patient-friendly health summary results."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class HealthSummary(Base):
    __tablename__ = "health_summaries"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("laboratory_reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_risk_index: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_tier: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    summary_sections_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    patient_friendly_text: Mapped[str] = mapped_column(Text, nullable=False)
    key_findings_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    recommendations_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    disclaimer: Mapped[str] = mapped_column(Text, nullable=False)
    generated_by: Mapped[str] = mapped_column(String(50), default="DETERMINISTIC_TEMPLATE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    report: Mapped["LaboratoryReport"] = relationship(back_populates="health_summary")
