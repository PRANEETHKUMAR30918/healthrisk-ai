"""Patient management endpoints."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.repositories.patient_repository import PatientRepository
from app.repositories.extraction_repository import ExtractionRepository
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter()

@router.post("", response_model=PatientResponse, status_code=201)
async def create_patient(
    payload: PatientCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = PatientRepository(db)
    existing = await repo.get_by_code(payload.patient_code)
    if existing:
        raise HTTPException(status_code=400, detail="A patient with this code already exists.")
    patient = await repo.create(
        user_id=current_user.id,
        patient_code=payload.patient_code,
        date_of_birth=payload.date_of_birth,
        sex=payload.sex
    )
    return PatientResponse(
        id=patient.id,
        patient_code=patient.patient_code,
        date_of_birth=patient.date_of_birth,
        sex=patient.sex,
        user_id=patient.user_id,
        created_at=patient.created_at,
        report_count=0
    )

@router.get("", response_model=list[PatientResponse])
async def list_patients(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = PatientRepository(db)
    if current_user.role in ("clinician", "researcher", "admin"):
        patients = await repo.list_all()
    else:
        patients = await repo.list_by_user(current_user.id)
    out = []
    for p in patients:
        count = await repo.count_reports(p.id)
        latest_rid = await repo.get_latest_report_id(p.id)
        out.append(PatientResponse(
            id=p.id,
            patient_code=p.patient_code,
            date_of_birth=p.date_of_birth,
            sex=p.sex,
            user_id=p.user_id,
            created_at=p.created_at,
            report_count=count,
            latest_report_id=latest_rid
        ))
    return out

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = PatientRepository(db)
    p = await repo.get_by_id(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")
    if current_user.role not in ("clinician", "researcher", "admin") and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    count = await repo.count_reports(p.id)
    latest_rid = await repo.get_latest_report_id(p.id)
    return PatientResponse(
        id=p.id,
        patient_code=p.patient_code,
        date_of_birth=p.date_of_birth,
        sex=p.sex,
        user_id=p.user_id,
        created_at=p.created_at,
        report_count=count,
        latest_report_id=latest_rid
    )

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: uuid.UUID,
    payload: PatientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = PatientRepository(db)
    p = await repo.get_by_id(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")
    if current_user.role not in ("clinician", "researcher", "admin") and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    # Check if updated code clashes with another patient
    if payload.patient_code and payload.patient_code.strip() != p.patient_code:
        existing = await repo.get_by_code(payload.patient_code)
        if existing and existing.id != patient_id:
            raise HTTPException(status_code=400, detail="A patient with this code already exists.")

    update_data = payload.model_dump(exclude_unset=True)
    if "patient_code" in update_data and update_data["patient_code"]:
        update_data["patient_code"] = update_data["patient_code"].strip()

    updated = await repo.update(patient_id, **update_data)
    count = await repo.count_reports(patient_id)
    latest_rid = await repo.get_latest_report_id(patient_id)
    return PatientResponse(
        id=updated.id,
        patient_code=updated.patient_code,
        date_of_birth=updated.date_of_birth,
        sex=updated.sex,
        user_id=updated.user_id,
        created_at=updated.created_at,
        report_count=count,
        latest_report_id=latest_rid
    )

@router.delete("/{patient_id}", status_code=200)
async def delete_patient(
    patient_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    repo = PatientRepository(db)
    p = await repo.get_by_id(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")
    if current_user.role not in ("clinician", "researcher", "admin") and p.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    success = await repo.delete(patient_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete patient.")
    return {"status": "success", "message": f"Patient {p.patient_code} deleted successfully."}

@router.get("/{patient_id}/biomarkers/{biomarker_name}/trend")
async def get_biomarker_trend(
    patient_id: uuid.UUID,
    biomarker_name: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    ext_repo = ExtractionRepository(db)
    vals = await ext_repo.get_historical_values(patient_id, biomarker_name)
    return {
        "patient_id": patient_id,
        "biomarker": biomarker_name,
        "historical_values": vals
    }
