"""Analysis engine execution and results endpoints."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.models.health_summary import HealthSummary
from app.services.analysis_service import AnalysisService
from app.repositories.baseline_repository import BaselineRepository
from app.repositories.consistency_repository import ConsistencyRepository
from app.repositories.risk_repository import RiskRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.extraction_repository import ExtractionRepository
from app.core.logging import get_logger

logger = get_logger(__name__)
from app.schemas.baseline import BaselineResponse, BaselineResultItem
from app.schemas.consistency import ConsistencyResponse, ConsistencyRuleResultItem
from app.schemas.risk import RiskResponse, RiskCategoryResultItem, ContributingFactorItem
from app.schemas.summary import HealthSummaryResponse, SummarySectionItem

router = APIRouter()

@router.post("/{report_id}/analyze")
async def run_full_analysis(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    service = AnalysisService(db)
    return await service.run_analysis(report_id)

@router.get("/{report_id}/baseline", response_model=BaselineResponse)
async def get_baseline_results(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    rep_repo = ReportRepository(db)
    base_repo = BaselineRepository(db)
    report = await rep_repo.get_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    items = await base_repo.list_by_report(report_id)
    return BaselineResponse(
        report_id=report.id,
        patient_id=report.patient_id,
        results=[BaselineResultItem.model_validate(i) for i in items],
        overall_stability=0.85,
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/{report_id}/consistency", response_model=ConsistencyResponse)
async def get_consistency_results(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ConsistencyRepository(db)
    items = await repo.list_by_report(report_id)
    c_score = items[0].consistency_score if items and items[0].consistency_score is not None else 1.0
    r_score = items[0].reliability_score if items and items[0].reliability_score is not None else 0.85

    return ConsistencyResponse(
        report_id=report_id,
        consistency_score=c_score,
        reliability_score=r_score,
        avg_extraction_confidence=0.92,
        baseline_stability=0.85,
        rule_results=[ConsistencyRuleResultItem.model_validate(i) for i in items],
        disclaimer="Consistency results are automated cross-checks. Not a medical diagnosis."
    )

@router.get("/{report_id}/risk", response_model=RiskResponse)
async def get_risk_results(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = RiskRepository(db)
    items = await repo.list_by_report(report_id)
    hri = items[0].overall_hri if items and items[0].overall_hri is not None else 0.0

    tier = "Low risk indicator"
    if hri >= 0.65: tier = "Elevated risk indicator — clinical review recommended"
    elif hri >= 0.40: tier = "Moderate risk indicator — consider consultation"
    elif hri >= 0.20: tier = "Mild risk indicator — monitoring recommended"

    cat_items = []
    for i in items:
        factors = [ContributingFactorItem(**f) for f in i.contributing_factors_json]
        cat_items.append(RiskCategoryResultItem(
            risk_category_id=i.risk_category_id,
            risk_category_name=i.risk_category_name,
            normalized_score=i.normalized_score,
            severity_weight=i.severity_weight,
            severity_weighted_score=i.severity_weighted_score,
            is_flagged=i.is_flagged,
            contributing_factors=factors,
            explanation=i.explanation
        ))

    return RiskResponse(
        report_id=report_id,
        overall_health_risk_index=hri,
        risk_tier=tier,
        risk_category_results=cat_items,
        disclaimer="Decision-support risk indicator. Not a clinical diagnosis."
    )

@router.get("/{report_id}/summary", response_model=HealthSummaryResponse)
async def get_health_summary(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(HealthSummary).where(HealthSummary.report_id == report_id)
    res = await db.execute(stmt)
    summary = res.scalar_one_or_none()
    if not summary:
        # Check if report has extracted biomarkers; if so, generate analysis on demand
        ext_repo = ExtractionRepository(db)
        extractions = await ext_repo.list_by_report(report_id)
        if extractions:
            try:
                service = AnalysisService(db)
                await service.run_analysis(report_id)
                res = await db.execute(stmt)
                summary = res.scalar_one_or_none()
            except Exception as e:
                logger.error(f"Auto-analysis failed for report {report_id}: {e}")

        if not summary:
            raise HTTPException(status_code=404, detail="Health summary not found. Please run analysis first.")

    sections = [SummarySectionItem(**s) for s in summary.summary_sections_json]
    return HealthSummaryResponse(
        report_id=summary.report_id,
        overall_risk_index=summary.overall_risk_index,
        risk_tier=summary.risk_tier,
        summary_sections=sections,
        patient_friendly_text=summary.patient_friendly_text,
        key_findings=summary.key_findings_json,
        recommendations=summary.recommendations_json,
        disclaimer=summary.disclaimer,
        generated_by=summary.generated_by,
        created_at=summary.created_at
    )
