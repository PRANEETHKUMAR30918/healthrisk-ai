"""Application configuration via pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "HealthRisk AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./healthrisk.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # File upload
    MAX_FILE_SIZE_MB: int = 20
    UPLOAD_DIR: str = "uploads"

    # Clinical rules directory
    RULES_DIR: str = "app/rules"

    # Engine 1 — Baseline thresholds
    MIN_HISTORY_COUNT: int = 3
    BASELINE_Z_THRESHOLD_MINOR: float = 1.0
    BASELINE_Z_THRESHOLD_MODERATE: float = 2.0
    BASELINE_Z_THRESHOLD_SIGNIFICANT: float = 3.0

    # Engine 2 — Reliability score weights (must sum to 1.0)
    CONSISTENCY_W1: float = 0.4  # consistency score weight
    CONSISTENCY_W2: float = 0.4  # extraction confidence weight
    CONSISTENCY_W3: float = 0.2  # baseline stability weight


settings = Settings()
