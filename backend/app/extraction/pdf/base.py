"""Abstract interface for PDF document text and table extraction."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class PageContent:
    page_number: int
    text: str
    tables: list[list[list[str]]] = field(default_factory=list)
    has_text: bool = False

@dataclass
class PDFExtractionResult:
    pages: list[PageContent]
    total_pages: int
    has_extractable_text: bool
    extraction_method: str
    error: Optional[str] = None

class PDFExtractor(ABC):
    @abstractmethod
    def extract(self, file_path: str) -> PDFExtractionResult:
        """Extract text and structured tabular contents from PDF."""
        pass

    @abstractmethod
    def is_text_extractable(self, file_path: str) -> bool:
        """Determine if PDF contains sufficient native text streams."""
        pass
