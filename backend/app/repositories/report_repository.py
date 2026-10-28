"""Laboratory report data access repository."""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.report import LaboratoryReport

class ReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, report_id: uuid.UUID) -> Optional[LaboratoryReport]:
        stmt = select(LaboratoryReport).where(LaboratoryReport.id == report_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_by_patient(self, patient_id: uuid.UUID) -> list[LaboratoryReport]:
        stmt = select(LaboratoryReport).where(LaboratoryReport.patient_id == patient_id).order_by(LaboratoryReport.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def list_recent(self, limit: int = 10) -> list[LaboratoryReport]:
        stmt = select(LaboratoryReport).order_by(LaboratoryReport.created_at.desc()).limit(limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def create(
        self,
        patient_id: uuid.UUID,
        filename: str,
        original_filename: str,
        file_path: str,
        file_type: str,
        file_size_bytes: int,
        report_date=None,
        lab_name=None
    ) -> LaboratoryReport:
        report = LaboratoryReport(
            patient_id=patient_id,
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_type,
            file_size_bytes=file_size_bytes,
            report_date=report_date,
            lab_name=lab_name,
            processing_status="PENDING"
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def update_status(self, report_id: uuid.UUID, status: str, method: str = None, error: str = None):
        report = await self.get_by_id(report_id)
        if report:
            report.processing_status = status
            if method:
                report.extraction_method = method
            if error:
                report.error_message = error
            await self.db.commit()
            await self.db.refresh(report)
        return report
