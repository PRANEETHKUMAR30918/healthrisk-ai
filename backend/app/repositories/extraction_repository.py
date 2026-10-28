"""Extraction results repository."""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.extraction_result import ExtractionResult
from app.models.report import LaboratoryReport

class ExtractionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_report(self, report_id: uuid.UUID) -> list[ExtractionResult]:
        stmt = select(ExtractionResult).where(ExtractionResult.report_id == report_id).order_by(ExtractionResult.biomarker_name_canonical)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_by_id(self, item_id: uuid.UUID) -> Optional[ExtractionResult]:
        stmt = select(ExtractionResult).where(ExtractionResult.id == item_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def save_extracted_biomarkers(self, report_id: uuid.UUID, biomarkers: list) -> list[ExtractionResult]:
        db_items = []
        for b in biomarkers:
            item = ExtractionResult(
                report_id=report_id,
                biomarker_name_raw=b.biomarker_name_raw,
                biomarker_name_canonical=b.biomarker_name_canonical,
                numeric_value=b.numeric_value,
                unit=b.unit,
                ref_low_extracted=b.ref_low,
                ref_high_extracted=b.ref_high,
                abnormal_flag=b.abnormal_flag,
                confidence_score=b.confidence_score,
                source_location=b.source_location,
                extraction_status="REVIEW_REQUIRED" if b.needs_review else "EXTRACTED"
            )
            self.db.add(item)
            db_items.append(item)
        await self.db.commit()
        return db_items

    async def apply_correction(self, item_id: uuid.UUID, user_id: uuid.UUID, corrected_value: float, corrected_unit: Optional[str]) -> Optional[ExtractionResult]:
        item = await self.get_by_id(item_id)
        if not item:
            return None
        item.is_corrected = True
        item.corrected_by = user_id
        item.corrected_value = corrected_value
        if corrected_unit:
            item.corrected_unit = corrected_unit
        item.extraction_status = "VERIFIED"
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def get_historical_values(self, patient_id: uuid.UUID, canonical_name: str, exclude_report_id: uuid.UUID = None) -> list[float]:
        """Fetch historical numeric readings for this patient and biomarker."""
        stmt = (
            select(ExtractionResult)
            .join(LaboratoryReport, ExtractionResult.report_id == LaboratoryReport.id)
            .where(
                and_(
                    LaboratoryReport.patient_id == patient_id,
                    ExtractionResult.biomarker_name_canonical == canonical_name,
                    ExtractionResult.report_id != exclude_report_id if exclude_report_id else True
                )
            )
            .order_by(LaboratoryReport.created_at.asc())
        )
        res = await self.db.execute(stmt)
        items = res.scalars().all()
        values = []
        for i in items:
            v = i.corrected_value if i.is_corrected and i.corrected_value is not None else i.numeric_value
            if v is not None:
                values.append(float(v))
        return values
