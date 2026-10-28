"""Laboratory report lifecycle and file storage service."""
import os
import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.report_repository import ReportRepository
from app.repositories.patient_repository import PatientRepository
from app.extraction.file_validator import validate_upload_file
from app.utils.file_utils import generate_safe_filename, ensure_directory
from app.core.config import settings

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_repo = ReportRepository(db)
        self.patient_repo = PatientRepository(db)

    async def handle_upload(
        self,
        patient_id: uuid.UUID,
        file: UploadFile,
        report_date=None,
        lab_name=None
    ):
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found.")

        # Read contents to check size and save
        content = await file.read()
        val = validate_upload_file(file.filename, len(content))
        if not val.is_valid:
            raise HTTPException(status_code=400, detail=val.error)

        ensure_directory(settings.UPLOAD_DIR)
        safe_name = generate_safe_filename(file.filename)
        dest_path = os.path.join(settings.UPLOAD_DIR, safe_name)

        with open(dest_path, "wb") as f:
            f.write(content)

        report = await self.report_repo.create(
            patient_id=patient_id,
            filename=safe_name,
            original_filename=file.filename,
            file_path=dest_path,
            file_type=val.file_type,
            file_size_bytes=len(content),
            report_date=report_date,
            lab_name=lab_name
        )
        return report
