"""PyPDF2 implementation of PDFExtractor (fallback parser)."""
from .base import PDFExtractor, PDFExtractionResult, PageContent
from app.core.logging import get_logger

logger = get_logger(__name__)

class PyPDF2Extractor(PDFExtractor):
    def is_text_extractable(self, file_path: str) -> bool:
        try:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                text = ""
                for page in reader.pages[:3]:
                    text += page.extract_text() or ""
                return len(text.strip()) > 50
        except Exception:
            return False

    def extract(self, file_path: str) -> PDFExtractionResult:
        try:
            import PyPDF2
            pages = []
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    pages.append(PageContent(
                        page_number=idx + 1,
                        text=text,
                        tables=[],
                        has_text=len(text.strip()) > 20
                    ))
            return PDFExtractionResult(
                pages=pages,
                total_pages=len(pages),
                has_extractable_text=any(p.has_text for p in pages),
                extraction_method="PDF_TEXT_PYPDF2"
            )
        except Exception as e:
            logger.error("pypdf2_extraction_failed", error=str(e), path=file_path)
            return PDFExtractionResult(
                pages=[],
                total_pages=0,
                has_extractable_text=False,
                extraction_method="PDF_TEXT_PYPDF2",
                error=str(e)
            )
