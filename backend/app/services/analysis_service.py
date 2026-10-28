"""Analytical engines execution and orchestration."""
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.report_repository import ReportRepository
from app.repositories.extraction_repository import ExtractionRepository
from app.repositories.baseline_repository import BaselineRepository
from app.repositories.consistency_repository import ConsistencyRepository
from app.repositories.risk_repository import RiskRepository
from app.engines.baseline.engine import PersonalizedBaselineEngine
from app.engines.baseline.models import BaselineInput
from app.engines.consistency.engine import PhysiologicalConsistencyEngine
from app.engines.risk.engine import MultiTestRiskEngine
from app.services.summary_service import SummaryService
from app.core.logging import get_logger

logger = get_logger(__name__)

class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_repo = ReportRepository(db)
        self.extraction_repo = ExtractionRepository(db)
        self.baseline_repo = BaselineRepository(db)
        self.consistency_repo = ConsistencyRepository(db)
        self.risk_repo = RiskRepository(db)
        self.summary_service = SummaryService(db)

        self.baseline_engine = PersonalizedBaselineEngine()
        self.consistency_engine = PhysiologicalConsistencyEngine()
        self.risk_engine = MultiTestRiskEngine()

    async def run_analysis(self, report_id: uuid.UUID):
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")

        extractions = await self.extraction_repo.list_by_report(report_id)
        if not extractions:
            raise HTTPException(status_code=400, detail="No extracted biomarkers found. Please run extraction first.")

        # Map current values
        current_values: dict[str, float] = {}
        abnormal_flags: dict[str, bool] = {}
        units_map: dict[str, str] = {}
        confidences: list[float] = []

        for e in extractions:
            canonical = e.biomarker_name_canonical
            if not canonical:
                continue
            val = e.corrected_value if e.is_corrected and e.corrected_value is not None else e.numeric_value
            if val is not None:
                current_values[canonical] = float(val)
                abnormal_flags[canonical] = bool(e.abnormal_flag) if e.abnormal_flag is not None else False
                units_map[canonical] = e.corrected_unit or e.unit or ""
                confidences.append(e.confidence_score)

        avg_conf = (sum(confidences) / len(confidences)) if confidences else 1.0

        # ENGINE 1: BASELINE
        baseline_inputs = []
        historical_dict: dict[str, list[float]] = {}
        for canonical, val in current_values.items():
            hist = await self.extraction_repo.get_historical_values(
                patient_id=report.patient_id,
                canonical_name=canonical,
                exclude_report_id=report_id
            )
            historical_dict[canonical] = hist
            baseline_inputs.append(BaselineInput(
                biomarker_name=canonical,
                current_value=val,
                current_unit=units_map.get(canonical, ""),
                historical_values=hist
            ))

        baseline_outputs = self.baseline_engine.analyze(baseline_inputs)
        await self.baseline_repo.save_results(report_id, baseline_outputs)
        baseline_stability = self.baseline_engine.calculate_stability(historical_dict)

        # Build Z-score deviation lookup
        z_deviations = {b.biomarker_name: (b.z_score or 0.0) for b in baseline_outputs}

        # ENGINE 2: CONSISTENCY & RELIABILITY
        consistency_out = self.consistency_engine.analyze(
            biomarker_values=current_values,
            avg_extraction_confidence=avg_conf,
            baseline_stability=baseline_stability
        )
        await self.consistency_repo.save_results(report_id, consistency_out)

        # ENGINE 3: MULTI-TEST RISK
        risk_out = self.risk_engine.analyze(
            biomarker_values=current_values,
            abnormal_flags=abnormal_flags,
            baseline_deviations=z_deviations
        )
        await self.risk_repo.save_results(report_id, risk_out)

        # HEALTH SUMMARY
        await self.summary_service.generate_summary(
            report_id=report_id,
            baseline_outputs=baseline_outputs,
            consistency_out=consistency_out,
            risk_out=risk_out
        )

        await self.report_repo.update_status(report_id, "ANALYZED")

        return {
            "report_id": report_id,
            "status": "ANALYZED",
            "consistency_score": consistency_out.consistency_score,
            "reliability_score": consistency_out.reliability_score,
            "overall_health_risk_index": risk_out.overall_health_risk_index,
            "risk_tier": risk_out.risk_tier.value
        }
