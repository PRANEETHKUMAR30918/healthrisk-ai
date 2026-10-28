"""Baseline analysis results repository."""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.baseline_result import BaselineResult

class BaselineRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_report(self, report_id: uuid.UUID) -> list[BaselineResult]:
        stmt = select(BaselineResult).where(BaselineResult.report_id == report_id).order_by(BaselineResult.biomarker_name)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def save_results(self, report_id: uuid.UUID, outputs: list) -> list[BaselineResult]:
        # Clear existing
        curr = await self.list_by_report(report_id)
        for c in curr:
            await self.db.delete(c)

        db_items = []
        for o in outputs:
            item = BaselineResult(
                report_id=report_id,
                biomarker_name=o.biomarker_name,
                historical_mean=o.historical_mean,
                historical_std=o.historical_std,
                z_score=o.z_score,
                sample_count=o.sample_count,
                deviation_status=o.deviation_status.value if hasattr(o.deviation_status, "value") else str(o.deviation_status),
                data_source=o.data_source,
                trend_direction=o.trend_direction,
                current_value=o.current_value,
                current_unit=o.current_unit
            )
            self.db.add(item)
            db_items.append(item)
        await self.db.commit()
        return db_items
