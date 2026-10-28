"""File validation for uploaded reports."""
from dataclasses import dataclass
from typing import Optional
from app.utils.file_utils import get_file_extension, ALLOWED_EXTENSIONS
from app.core.config import settings

@dataclass
class ValidationResult:
    is_valid: bool
    error: Optional[str] = None
    file_type: Optional[str] = None

def validate_upload_file(filename: str, file_size_bytes: int) -> ValidationResult:
    """Validate uploaded document metadata."""
    ext = get_file_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        return ValidationResult(
            is_valid=False,
            error=f"Unsupported format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        mb = file_size_bytes / (1024 * 1024)
        return ValidationResult(
            is_valid=False,
            error=f"File size ({mb:.1f} MB) exceeds maximum allowed limit ({settings.MAX_FILE_SIZE_MB} MB)"
        )

    if file_size_bytes == 0:
        return ValidationResult(is_valid=False, error="File is empty")

    file_type = "pdf" if ext == ".pdf" else "image"
    return ValidationResult(is_valid=True, file_type=file_type)
