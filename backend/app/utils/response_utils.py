"""Standard API response wrappers."""
from typing import Any

def success_response(data: Any, message: str = "Operation successful") -> dict:
    return {"status": "success", "message": message, "data": data}

def error_response(message: str, code: str = "BAD_REQUEST", details: Any = None) -> dict:
    return {"status": "error", "code": code, "message": message, "details": details}
