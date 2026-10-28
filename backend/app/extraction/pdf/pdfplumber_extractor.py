"""pdfplumber implementation of PDFExtractor."""
from .base import PDFExtractor, PDFExtractionResult, PageContent
from app.core.logging import get_logger

logger = get_logger(__name__)

class PdfPlumberExtractor(PDFExtractor):
    def is_text_extractable(self, file_path: str) -> bool:
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                total_text = ""
                for p in pdf.pages[:3]:
                    txt = p.extract_text() or ""
                    total_text += txt
                return len(total_text.strip()) > 50
        except Exception as e:
            logger.warning("pdfplumber_text_check_error", error=str(e), path=file_path)
            return False

    def extract(self, file_path: str) -> PDFExtractionResult:
        try:
            import pdfplumber
            pages = []
            with pdfplumber.open(file_path) as pdf:
                for idx, page in enumerate(pdf.pages):
                    raw_text = page.extract_text() or ""
                    raw_tables = page.extract_tables() or []
                    clean_tables = []
                    for t in raw_tables:
                        cleaned = [[str(cell or "").strip() for cell in row] for row in t if row]
                        clean_tables.append(cleaned)

                    pages.append(PageContent(
                        page_number=idx + 1,
                        text=raw_text,
                        tables=clean_tables,
                        has_text=len(raw_text.strip()) > 20
                    ))

            has_text = any(p.has_text for p in pages)
            return PDFExtractionResult(
                pages=pages,
                total_pages=len(pages),
                has_extractable_text=has_text,
                extraction_method="PDF_TEXT_PLUMBER"
            )
        except Exception as e:
            logger.error("pdfplumber_extraction_failed", error=str(e), path=file_path)
            return PDFExtractionResult(
                pages=[],
                total_pages=0,
                has_extractable_text=False,
                extraction_method="PDF_TEXT_PLUMBER",
                error=str(e)
            )
