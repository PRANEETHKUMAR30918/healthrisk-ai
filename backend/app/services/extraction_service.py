"""Extraction service managing NLP & OCR workflow."""
import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.report_repository import ReportRepository
from app.repositories.extraction_repository import ExtractionRepository
from app.extraction.pipeline import ExtractionPipeline
from app.core.logging import get_logger

logger = get_logger(__name__)

class ExtractionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.report_repo = ReportRepository(db)
        self.extraction_repo = ExtractionRepository(db)
        self.pipeline = ExtractionPipeline()

    async def execute_extraction(self, report_id: uuid.UUID):
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")

        await self.report_repo.update_status(report_id, "PROCESSING")
        try:
            res = self.pipeline.process(report.file_path, report.file_type)
            if not res.success and res.error:
                await self.report_repo.update_status(report_id, "FAILED", error=res.error)
                return {"success": False, "error": res.error}

            await self.extraction_repo.save_extracted_biomarkers(report_id, res.biomarkers)
            await self.report_repo.update_status(
                report_id,
                status="EXTRACTION_DONE",
                method=res.extraction_method
            )
            return {
                "success": True,
                "biomarkers_count": len(res.biomarkers),
                "extraction_method": res.extraction_method,
                "overall_confidence": res.overall_confidence
            }
        except Exception as e:
            logger.error("extraction_execution_failed", error=str(e), report_id=str(report_id))
            await self.report_repo.update_status(report_id, "FAILED", error=str(e))
            raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
