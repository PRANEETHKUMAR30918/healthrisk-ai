"""Risk analysis results repository."""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.risk_result import RiskResult

class RiskRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_report(self, report_id: uuid.UUID) -> list[RiskResult]:
        stmt = select(RiskResult).where(RiskResult.report_id == report_id).order_by(RiskResult.severity_weighted_score.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def save_results(self, report_id: uuid.UUID, engine_output) -> list[RiskResult]:
        curr = await self.list_by_report(report_id)
        for c in curr:
            await self.db.delete(c)

        db_items = []
        for cat in engine_output.risk_category_results:
            factors = [
                {
                    "biomarker": f.biomarker,
                    "value": f.value,
                    "abnormal": f.abnormal,
                    "weight": f.weight,
                    "feature_score": f.feature_score
                }
                for f in cat.contributing_factors
            ]
            item = RiskResult(
                report_id=report_id,
                risk_category_id=cat.risk_category_id,
                risk_category_name=cat.risk_category_name,
                normalized_score=cat.normalized_score,
                severity_weight=cat.severity_weight,
                severity_weighted_score=cat.severity_weighted_score,
                is_flagged=cat.is_flagged,
                contributing_factors_json=factors,
                explanation=cat.explanation,
                overall_hri=engine_output.overall_health_risk_index
            )
            self.db.add(item)
            db_items.append(item)
        await self.db.commit()
        return db_items
