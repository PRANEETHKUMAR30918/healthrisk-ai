"""Engine 3: Multi-test weighted risk assessment results."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Boolean, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class RiskResult(Base):
    __tablename__ = "risk_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("laboratory_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_category_id: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_category_name: Mapped[str] = mapped_column(String(128), nullable=False)
    normalized_score: Mapped[float] = mapped_column(Float, nullable=False)
    severity_weight: Mapped[float] = mapped_column(Float, nullable=False)
    severity_weighted_score: Mapped[float] = mapped_column(Float, nullable=False)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    contributing_factors_json: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    overall_hri: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    report: Mapped["LaboratoryReport"] = relationship(back_populates="risk_results")
