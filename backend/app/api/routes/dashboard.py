"""Aggregated dashboard metrics endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.models.patient import Patient
from app.models.report import LaboratoryReport
from app.models.consistency_result import ConsistencyResult
from app.models.risk_result import RiskResult

router = APIRouter()

@router.get("")
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    is_clinician = current_user.role in ("clinician", "researcher", "admin")

    # Total patients
    p_stmt = select(func.count(Patient.id))
    if not is_clinician:
        p_stmt = p_stmt.where(Patient.user_id == current_user.id)
    p_count = (await db.execute(p_stmt)).scalar() or 0

    # Total reports
    r_stmt = select(func.count(LaboratoryReport.id)).join(Patient, LaboratoryReport.patient_id == Patient.id)
    if not is_clinician:
        r_stmt = r_stmt.where(Patient.user_id == current_user.id)
    r_count = (await db.execute(r_stmt)).scalar() or 0

    # Recent reports
    rec_stmt = (
        select(LaboratoryReport)
        .join(Patient, LaboratoryReport.patient_id == Patient.id)
    )
    if not is_clinician:
        rec_stmt = rec_stmt.where(Patient.user_id == current_user.id)
    rec_stmt = rec_stmt.order_by(LaboratoryReport.created_at.desc()).limit(5)
    recent_reports = (await db.execute(rec_stmt)).scalars().all()

    # Latest consistency & reliability
    c_stmt = select(ConsistencyResult).order_by(ConsistencyResult.created_at.desc()).limit(1)
    latest_c = (await db.execute(c_stmt)).scalar_one_or_none()
    avg_consistency = latest_c.consistency_score if latest_c and latest_c.consistency_score is not None else 0.95
    avg_reliability = latest_c.reliability_score if latest_c and latest_c.reliability_score is not None else 0.90

    # Flagged risks
    flag_stmt = select(RiskResult).where(RiskResult.is_flagged == True).order_by(RiskResult.created_at.desc()).limit(5)
    flagged = (await db.execute(flag_stmt)).scalars().all()

    return {
        "total_patients": p_count,
        "total_reports": r_count,
        "avg_consistency_score": round(avg_consistency, 2),
        "avg_reliability_score": round(avg_reliability, 2),
        "recent_reports": [
            {
                "id": r.id,
                "filename": r.original_filename,
                "status": r.processing_status,
                "created_at": r.created_at
            }
            for r in recent_reports
        ],
        "flagged_risk_indicators": [
            {
                "id": f.id,
                "category": f.risk_category_name,
                "score": f.normalized_score,
                "explanation": f.explanation
            }
            for f in flagged
        ]
    }
