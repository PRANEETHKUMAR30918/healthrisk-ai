"""Authentication schemas."""
import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class UserRegister(BaseModel):
    email: str = Field(..., min_length=2, max_length=255, description="Email address or username")
    password: str = Field(..., min_length=4, description="Minimum 4 characters")
    full_name: str = Field(..., min_length=2, max_length=255)
    role: Optional[str] = "clinician"
    department: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None

class UserLogin(BaseModel):
    email: str = Field(..., description="Email address or username (e.g. doctor)")
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = "clinician"
    user_id: Optional[uuid.UUID] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    patient_id: Optional[uuid.UUID] = None

class TokenData(BaseModel):
    user_id: uuid.UUID
    email: str
    role: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    patient_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)
