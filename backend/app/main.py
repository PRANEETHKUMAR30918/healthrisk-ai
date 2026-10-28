"""FastAPI Main Application Entry Point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import configure_logging
from app.utils.file_utils import ensure_directory
from app.api.routes import auth, patients, reports, extraction, analysis, dashboard
from app.database.session import AsyncSessionLocal
from app.core.seed_doctor import seed_doctor_account

@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.LOG_LEVEL)
    ensure_directory(settings.UPLOAD_DIR)
    async with AsyncSessionLocal() as db:
        await seed_doctor_account(db)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "An Intelligent Model for Patient Health Risk Assessment Using Laboratory Report Analysis "
        "and Biological Consistency Modeling. Academic / Research Decision-Support Prototype."
    ),
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(extraction.router, prefix="/api/reports", tags=["Extraction"])
app.include_router(analysis.router, prefix="/api/reports", tags=["Analysis"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "disclaimer": "Academic research prototype only. Not a medical device."
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "HealthRisk AI Platform Active",
        "notice": "This system provides research-oriented clinical decision support and does not replace medical consultation."
    }
