"""EasyOCR Provider fallback implementation."""
import os
import tempfile
from .base import OCRProvider, OCRResult
from app.core.logging import get_logger

logger = get_logger(__name__)

class EasyOCRProvider(OCRProvider):
    def __init__(self, languages: list[str] = None):
        self.languages = languages or ["en"]
        self._reader = None

    def _get_reader(self):
        if self._reader is None:
            try:
                import easyocr
                self._reader = easyocr.Reader(self.languages, gpu=False)
            except Exception as e:
                logger.warning("easyocr_init_failed", error=str(e))
                return None
        return self._reader

    def process_image(self, image_path: str, page_number: int = 1) -> OCRResult:
        reader = self._get_reader()
        if not reader:
            return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_EASYOCR", error="EasyOCR unavailable")
        try:
            results = reader.readtext(image_path)
            texts = []
            confs = []
            for _, text, conf in results:
                texts.append(text)
                confs.append(float(conf))
            avg_conf = (sum(confs) / len(confs)) if confs else 0.70
            return OCRResult(
                text="\n".join(texts),
                confidence=round(avg_conf, 4),
                page_number=page_number,
                method="OCR_EASYOCR"
            )
        except Exception as e:
            logger.warning("easyocr_process_error", error=str(e))
            return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_EASYOCR", error=str(e))

    def process_pdf_page(self, file_path: str, page_number: int) -> OCRResult:
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(file_path, first_page=page_number, last_page=page_number, dpi=300)
            if not images:
                return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_EASYOCR", error="Render failed")

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                images[0].save(tmp.name, format="PNG")
                tmp_path = tmp.name

            try:
                return self.process_image(tmp_path, page_number=page_number)
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        except Exception as e:
            return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_EASYOCR", error=str(e))
