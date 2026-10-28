"""Engine 1: Personalized baseline deviation results."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class BaselineResult(Base):
    __tablename__ = "baseline_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("laboratory_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    biomarker_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("biomarkers.id", ondelete="SET NULL"), nullable=True)
    biomarker_name: Mapped[str] = mapped_column(String(128), nullable=False)
    historical_mean: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    historical_std: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    z_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deviation_status: Mapped[str] = mapped_column(String(100), nullable=False)
    data_source: Mapped[str] = mapped_column(String(50), default="PERSONAL_BASELINE", nullable=False)
    trend_direction: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    current_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    report: Mapped["LaboratoryReport"] = relationship(back_populates="baseline_results")
