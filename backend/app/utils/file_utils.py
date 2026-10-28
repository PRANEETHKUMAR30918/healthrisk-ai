"""File validation and handling utilities."""
import os
import uuid
from pathlib import Path

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def generate_safe_filename(original_filename: str) -> str:
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{ext}"

def ensure_directory(path: str) -> None:
    os.makedirs(path, exist_ok=True)
