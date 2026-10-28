"""Tesseract OCR Provider implementation."""
import os
import tempfile
from .base import OCRProvider, OCRResult
from app.core.logging import get_logger

logger = get_logger(__name__)

class TesseractProvider(OCRProvider):
    def __init__(self, lang: str = "eng", psm: int = 6):
        self.lang = lang
        self.config = f"--oem 3 --psm {psm}"

    def process_image(self, image_path: str, page_number: int = 1) -> OCRResult:
        try:
            import pytesseract
            from PIL import Image

            img = Image.open(image_path)
            text = pytesseract.image_to_string(img, lang=self.lang, config=self.config)
            data = pytesseract.image_to_data(img, lang=self.lang, config=self.config, output_type=pytesseract.Output.DICT)
            confs = [int(c) for c in data.get("conf", []) if str(c).isdigit() and int(c) > 0]
            avg_conf = (sum(confs) / len(confs) / 100.0) if confs else 0.75

            return OCRResult(
                text=text,
                confidence=round(avg_conf, 4),
                page_number=page_number,
                method="OCR_TESSERACT"
            )
        except Exception as e:
            logger.warning("tesseract_image_error", error=str(e), path=image_path)
            return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_TESSERACT", error=str(e))

    def process_pdf_page(self, file_path: str, page_number: int) -> OCRResult:
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(file_path, first_page=page_number, last_page=page_number, dpi=300)
            if not images:
                return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_TESSERACT", error="Render failed")

            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                images[0].save(tmp.name, format="PNG")
                tmp_path = tmp.name

            try:
                return self.process_image(tmp_path, page_number=page_number)
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        except Exception as e:
            logger.warning("tesseract_pdf_render_error", error=str(e), path=file_path)
            return OCRResult(text="", confidence=0.0, page_number=page_number, method="OCR_TESSERACT", error=str(e))
