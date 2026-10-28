"""Abstract interface for OCR Providers."""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class OCRResult:
    text: str
    confidence: float
    page_number: int
    method: str
    error: Optional[str] = None

class OCRProvider(ABC):
    @abstractmethod
    def process_image(self, image_path: str, page_number: int = 1) -> OCRResult:
        """Run OCR recognition directly on an image file."""
        pass

    @abstractmethod
    def process_pdf_page(self, file_path: str, page_number: int) -> OCRResult:
        """Render a PDF page to raster image and extract OCR text."""
        pass
