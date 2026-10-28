# Security Architecture & Data Privacy

## Authentication & Authorization
- **JWT Tokens**: Signed using HMAC-SHA256 (`HS256`) with secret keys configurable via environment variables.
- **Password Storage**: Passwords hashed using bcrypt with adaptive salt generation (`passlib`).
- **Role-Based Access**: Role field included in JWT token claims; endpoints protected by dependency injection guards.

## Input Validation & Sanitization
- **Strict Typing**: All request payloads strictly validated through Pydantic v2 schemas.
- **Upload Safety**: File size limits enforced (default 20MB); allowed extension whitelist (`.pdf`, `.png`, `.jpg`, `.jpeg`). Files saved with UUID-based randomized filenames to prevent directory traversal attacks.

## Sensitive Data & Auditing
- **De-Identification**: Synthetic patient IDs and codes used throughout. No direct patient identifying numbers required.
- **Audit Logs**: Authentication events, file uploads, manual extractions corrections, and engine evaluations recorded in `audit_logs` with timestamps, action identifiers, and status codes.
- **Safe Logging**: `structlog` configured to avoid logging sensitive health document contents or authentication credentials.
