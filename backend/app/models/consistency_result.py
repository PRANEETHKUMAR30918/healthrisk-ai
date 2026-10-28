"""Engine 2: Physiological consistency evaluation results."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Boolean, Text, ForeignKey, DateTime, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ConsistencyResult(Base):
    __tablename__ = "consistency_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("laboratory_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id: Mapped[str] = mapped_column(String(100), nullable=False)
    biomarker_a_name: Mapped[str] = mapped_column(String(128), nullable=False)
    biomarker_b_name: Mapped[str] = mapped_column(String(128), nullable=False)
    observed_a: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    observed_b: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    expected_relationship: Mapped[str] = mapped_column(String(128), nullable=False)
    is_consistent: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    consistency_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reliability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    report: Mapped["LaboratoryReport"] = relationship(back_populates="consistency_results")
