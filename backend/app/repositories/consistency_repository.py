"""Consistency analysis results repository."""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.consistency_result import ConsistencyResult

class ConsistencyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_report(self, report_id: uuid.UUID) -> list[ConsistencyResult]:
        stmt = select(ConsistencyResult).where(ConsistencyResult.report_id == report_id).order_by(ConsistencyResult.rule_id)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def save_results(self, report_id: uuid.UUID, engine_output) -> list[ConsistencyResult]:
        curr = await self.list_by_report(report_id)
        for c in curr:
            await self.db.delete(c)

        db_items = []
        for r in engine_output.rule_results:
            item = ConsistencyResult(
                report_id=report_id,
                rule_id=r.rule_id,
                biomarker_a_name=r.biomarker_a,
                biomarker_b_name=r.biomarker_b,
                observed_a=r.observed_a,
                observed_b=r.observed_b,
                expected_relationship=r.expected_relationship,
                is_consistent=r.is_consistent,
                explanation=r.explanation,
                status=r.status.value if hasattr(r.status, "value") else str(r.status),
                consistency_score=engine_output.consistency_score,
                reliability_score=engine_output.reliability_score
            )
            self.db.add(item)
            db_items.append(item)
        await self.db.commit()
        return db_items
