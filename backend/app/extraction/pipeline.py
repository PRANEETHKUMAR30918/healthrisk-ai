"""Full document processing orchestration pipeline."""
from dataclasses import dataclass, field
from app.extraction.pdf.pdfplumber_extractor import PdfPlumberExtractor
from app.extraction.pdf.pypdf2_extractor import PyPDF2Extractor
from app.extraction.ocr.tesseract_provider import TesseractProvider
from app.extraction.ocr.easyocr_provider import EasyOCRProvider
from app.extraction.nlp.biomarker_extractor import BiomarkerExtractor, ExtractedBiomarker
from app.extraction.normalization.normalizer import BiomarkerNormalizer
from app.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class ExtractionPipelineResult:
    success: bool
    extraction_method: str
    biomarkers: list[ExtractedBiomarker] = field(default_factory=list)
    overall_confidence: float = 0.0
    error: str | None = None

class ExtractionPipeline:
    def __init__(self):
        self.normalizer = BiomarkerNormalizer()
        self.pdf_plumber = PdfPlumberExtractor()
        self.pdf_pypdf2 = PyPDF2Extractor()
        self.tesseract = TesseractProvider()
        self.easyocr = EasyOCRProvider()
        self.biomarker_extractor = BiomarkerExtractor(self.normalizer)

    def process(self, file_path: str, file_type: str) -> ExtractionPipelineResult:
        if file_type == "pdf":
            return self._process_pdf(file_path)
        elif file_type == "image":
            return self._process_image(file_path)
        else:
            return ExtractionPipelineResult(success=False, extraction_method="UNKNOWN", error="Unsupported file type")

    def _deduplicate(self, biomarkers: list[ExtractedBiomarker]) -> list[ExtractedBiomarker]:
        best: dict[str, ExtractedBiomarker] = {}
        for b in biomarkers:
            key = b.biomarker_name_canonical or b.biomarker_name_raw
            if key not in best or b.confidence_score > best[key].confidence_score:
                best[key] = b
        return list(best.values())

    def _process_pdf(self, file_path: str) -> ExtractionPipelineResult:
        # Step 1: Check if PDF has native text
        if self.pdf_plumber.is_text_extractable(file_path):
            pdf_res = self.pdf_plumber.extract(file_path)
            if not pdf_res.error and pdf_res.pages:
                biomarkers = []
                for p in pdf_res.pages:
                    if p.tables:
                        biomarkers.extend(self.biomarker_extractor.extract_from_tables(p.tables, f"page {p.page_number}"))
                    text_extracted = self.biomarker_extractor.extract_from_text(p.text, f"page {p.page_number}")
                    biomarkers.extend(text_extracted)

                deduped = self._deduplicate(biomarkers)
                if deduped:
                    avg_c = sum(b.confidence_score for b in deduped) / len(deduped)
                    return ExtractionPipelineResult(
                        success=True,
                        extraction_method="PDF_TEXT_PLUMBER",
                        biomarkers=deduped,
                        overall_confidence=round(avg_c, 4)
                    )

        # Step 2: Fallback to OCR for scanned PDF
        ocr_biomarkers = []
        total_ocr_conf = 0.0
        # Sample first 3 pages
        for page_no in range(1, 4):
            res = self.tesseract.process_pdf_page(file_path, page_no)
            if res.error or not res.text.strip():
                res = self.easyocr.process_pdf_page(file_path, page_no)
            if res.text.strip():
                total_ocr_conf += res.confidence
                extracted = self.biomarker_extractor.extract_from_text(res.text, f"ocr page {page_no}", ocr_conf=res.confidence)
                ocr_biomarkers.extend(extracted)

        deduped = self._deduplicate(ocr_biomarkers)
        avg_c = (sum(b.confidence_score for b in deduped) / len(deduped)) if deduped else 0.0
        return ExtractionPipelineResult(
            success=len(deduped) > 0,
            extraction_method="OCR_FALLBACK",
            biomarkers=deduped,
            overall_confidence=round(avg_c, 4)
        )

    def _process_image(self, file_path: str) -> ExtractionPipelineResult:
        res = self.tesseract.process_image(file_path, 1)
        if res.error or not res.text.strip():
            res = self.easyocr.process_image(file_path, 1)

        if not res.text.strip():
            return ExtractionPipelineResult(success=False, extraction_method=res.method, error="OCR failed to detect readable text")

        extracted = self.biomarker_extractor.extract_from_text(res.text, "image page 1", ocr_conf=res.confidence)
        deduped = self._deduplicate(extracted)
        avg_c = (sum(b.confidence_score for b in deduped) / len(deduped)) if deduped else 0.0
        return ExtractionPipelineResult(
            success=True,
            extraction_method=res.method,
            biomarkers=deduped,
            overall_confidence=round(avg_c, 4)
        )
