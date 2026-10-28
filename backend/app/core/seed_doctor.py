"""Seed default doctor account on startup."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password

logger = logging.getLogger(__name__)

DOCTOR_EMAIL = "doctor@healthrisk.ai"
DOCTOR_USERNAME = "doctor"
DOCTOR_PASSWORD = "doctor"
DOCTOR_FULL_NAME = "Dr. Primary Physician"
DOCTOR_ROLE = "clinician"


async def seed_doctor_account(db: AsyncSession) -> None:
    """Create a default doctor account if it does not exist."""
    try:
        # Check by email
        stmt = select(User).where(User.email == DOCTOR_EMAIL)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            logger.info("Doctor account already exists, skipping seed.")
            return

        pw_hash = hash_password(DOCTOR_PASSWORD)
        doctor = User(
            email=DOCTOR_EMAIL,
            password_hash=pw_hash,
            full_name=DOCTOR_FULL_NAME,
            role=DOCTOR_ROLE,
            is_active=True,
        )
        db.add(doctor)
        await db.commit()
        await db.refresh(doctor)
        logger.info("Doctor account seeded: email=%s", DOCTOR_EMAIL)
    except Exception as exc:
        logger.warning("Doctor seed failed (may already exist): %s", exc)
        await db.rollback()
