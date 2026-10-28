"""Extraction review and correction endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.services.extraction_service import ExtractionService
from app.repositories.report_repository import ReportRepository
from app.repositories.extraction_repository import ExtractionRepository
from app.schemas.extraction import ExtractionReviewResponse, ExtractedBiomarkerItem, BiomarkerCorrectionRequest

router = APIRouter()

@router.post("/{report_id}/extract")
async def trigger_extraction(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = ExtractionService(db)
    return await service.execute_extraction(report_id)

@router.get("/{report_id}/extraction", response_model=ExtractionReviewResponse)
async def get_extraction_results(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    rep_repo = ReportRepository(db)
    ext_repo = ExtractionRepository(db)

    report = await rep_repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    items = await ext_repo.list_by_report(report_id)
    avg_c = (sum(i.confidence_score for i in items) / len(items)) if items else 0.0

    return ExtractionReviewResponse(
        report_id=report.id,
        processing_status=report.processing_status,
        extraction_method=report.extraction_method,
        overall_confidence=round(avg_c, 4),
        biomarkers=[ExtractedBiomarkerItem.model_validate(i) for i in items]
    )

@router.put("/{report_id}/extraction/{biomarker_id}", response_model=ExtractedBiomarkerItem)
async def correct_biomarker_value(
    report_id: uuid.UUID,
    biomarker_id: uuid.UUID,
    payload: BiomarkerCorrectionRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    ext_repo = ExtractionRepository(db)
    corrected = await ext_repo.apply_correction(
        item_id=biomarker_id,
        user_id=current_user.id,
        corrected_value=payload.corrected_value,
        corrected_unit=payload.corrected_unit
    )
    if not corrected:
        raise HTTPException(status_code=404, detail="Biomarker result not found.")
    return ExtractedBiomarkerItem.model_validate(corrected)
