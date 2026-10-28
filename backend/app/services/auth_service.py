"""Authentication & token issuance service."""
import uuid
import re
from datetime import date
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.user_repository import UserRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.audit_repository import AuditRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.models.patient import Patient


def _is_email(value: str) -> bool:
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", value))


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.patient_repo = PatientRepository(db)
        self.audit_repo = AuditRepository(db)

    async def register(self, payload: UserRegister, ip: str = None) -> UserResponse:
        # Determine canonical email: if username-style, append default domain
        raw_email = payload.email.strip()
        if _is_email(raw_email):
            canonical_email = raw_email.lower()
        else:
            canonical_email = f"{raw_email.lower()}@healthrisk.ai"

        existing = await self.user_repo.get_by_email(canonical_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email or username already exists."
            )

        pw_hash = hash_password(payload.password)
        allowed_roles = ("clinician", "researcher", "admin", "patient")
        role = payload.role if payload.role in allowed_roles else "clinician"

        user = await self.user_repo.create(
            email=canonical_email,
            password_hash=pw_hash,
            full_name=payload.full_name,
            role=role
        )

        patient_id: Optional[uuid.UUID] = None

        # Auto-create Patient record for patient registrations
        if role == "patient":
            dob: Optional[date] = payload.date_of_birth
            sex: Optional[str] = payload.sex
            if sex:
                sex = sex.upper()
                if sex not in ("M", "F", "OTHER"):
                    sex = None
            patient_code = payload.full_name.strip()
            patient = await self.patient_repo.create(
                user_id=user.id,
                patient_code=patient_code,
                date_of_birth=dob,
                sex=sex
            )
            patient_id = patient.id

        await self.audit_repo.log(
            action="USER_REGISTER",
            user_id=user.id,
            resource_type="USER",
            resource_id=user.id,
            ip_address=ip
        )

        # Build response manually since UserResponse expects patient_id
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            patient_id=patient_id,
        )

    async def login(self, payload: UserLogin, ip: str = None) -> Token:
        raw_input = payload.email.strip()

        # Support username-only login (e.g. "doctor")
        if _is_email(raw_input):
            user = await self.user_repo.get_by_email(raw_input.lower())
        else:
            # Try as username-style by appending @healthrisk.ai
            canonical = f"{raw_input.lower()}@healthrisk.ai"
            user = await self.user_repo.get_by_email(canonical)
            # Also try original string (edge case)
            if not user:
                user = await self.user_repo.get_by_email(raw_input.lower())

        if not user or not verify_password(payload.password, user.password_hash):
            await self.audit_repo.log(
                action="USER_LOGIN_FAILED",
                details={"email": payload.email},
                ip_address=ip,
                status="FAILED"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password."
            )
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled.")

        # Look up linked patient_id (if this user is a patient)
        patient_id: Optional[uuid.UUID] = None
        if user.role == "patient":
            stmt = select(Patient).where(Patient.user_id == user.id).limit(1)
            res = await self.db.execute(stmt)
            pat = res.scalar_one_or_none()
            if pat:
                patient_id = pat.id

        token = create_access_token(data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        })

        await self.audit_repo.log(
            action="USER_LOGIN_SUCCESS",
            user_id=user.id,
            resource_type="USER",
            resource_id=user.id,
            ip_address=ip
        )

        return Token(
            access_token=token,
            token_type="bearer",
            role=user.role,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            patient_id=patient_id,
        )
