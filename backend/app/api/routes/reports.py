"""Laboratory report endpoints."""
import uuid
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.services.report_service import ReportService
from app.repositories.report_repository import ReportRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.report import ReportResponse

router = APIRouter()

@router.post("/upload", response_model=ReportResponse, status_code=201)
async def upload_report(
    patient_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    report_date: Optional[date] = Form(None),
    lab_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = ReportService(db)
    report = await service.handle_upload(
        patient_id=patient_id,
        file=file,
        report_date=report_date,
        lab_name=lab_name
    )
    return ReportResponse.model_validate(report)

@router.get("", response_model=list[ReportResponse])
async def list_reports(
    patient_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ReportRepository(db)
    if patient_id:
        reports = await repo.list_by_patient(patient_id)
    else:
        reports = await repo.list_recent(limit=50)
    return [ReportResponse.model_validate(r) for r in reports]

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ReportRepository(db)
    r = await repo.get_by_id(report_id)
    if not r:
        raise HTTPException(status_code=404, detail="Report not found.")
    return ReportResponse.model_validate(r)
