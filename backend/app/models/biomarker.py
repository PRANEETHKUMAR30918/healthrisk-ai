"""Biomarker definition and population reference ranges."""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, ForeignKey, DateTime, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class Biomarker(Base):
    __tablename__ = "biomarkers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    canonical_name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    panel: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_unit: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    reference_ranges: Mapped[list["ReferenceRange"]] = relationship(back_populates="biomarker", cascade="all, delete-orphan")

class ReferenceRange(Base):
    __tablename__ = "reference_ranges"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    biomarker_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("biomarkers.id", ondelete="CASCADE"), nullable=False)
    sex: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    age_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    age_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    ref_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ref_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    source: Mapped[str] = mapped_column(String(128), default="Standard Reference", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    biomarker: Mapped["Biomarker"] = relationship(back_populates="reference_ranges")
