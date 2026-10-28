"""Patient data access repository."""
import uuid
from typing import Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.patient import Patient
from app.models.report import LaboratoryReport

class PatientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, patient_id: uuid.UUID) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.id == patient_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.patient_code == code.strip())
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_by_user(self, user_id: uuid.UUID) -> list[Patient]:
        stmt = select(Patient).where(Patient.user_id == user_id).order_by(Patient.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def list_all(self) -> list[Patient]:
        stmt = select(Patient).order_by(Patient.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def count_reports(self, patient_id: uuid.UUID) -> int:
        stmt = select(func.count(LaboratoryReport.id)).where(LaboratoryReport.patient_id == patient_id)
        res = await self.db.execute(stmt)
        return res.scalar() or 0

    async def get_latest_report_id(self, patient_id: uuid.UUID) -> Optional[uuid.UUID]:
        stmt = (
            select(LaboratoryReport.id)
            .where(
                LaboratoryReport.patient_id == patient_id,
                LaboratoryReport.processing_status != "FAILED"
            )
            .order_by(LaboratoryReport.created_at.desc())
            .limit(1)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def create(self, user_id: uuid.UUID, patient_code: str, date_of_birth: Optional[date], sex: Optional[str]) -> Patient:
        patient = Patient(
            user_id=user_id,
            patient_code=patient_code.strip(),
            date_of_birth=date_of_birth,
            sex=sex
        )
        self.db.add(patient)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient

    async def update(self, patient_id: uuid.UUID, **kwargs) -> Optional[Patient]:
        patient = await self.get_by_id(patient_id)
        if not patient:
            return None
        for k, v in kwargs.items():
            if hasattr(patient, k) and v is not None:
                setattr(patient, k, v)
        await self.db.commit()
        await self.db.refresh(patient)
        return patient

    async def delete(self, patient_id: uuid.UUID) -> bool:
        patient = await self.get_by_id(patient_id)
        if not patient:
            return False
        await self.db.delete(patient)
        await self.db.commit()
        return True
