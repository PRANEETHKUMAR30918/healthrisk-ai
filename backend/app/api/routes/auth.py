from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(payload: UserRegister, request: Request, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    service = AuthService(db)
    ip = request.client.host if request.client else None
    return await service.register(payload, ip=ip)

@router.post("/login", response_model=Token)
async def login_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate and receive JWT token. Supports both JSON body and Swagger OAuth2 form data."""
    service = AuthService(db)
    ip = request.client.host if request.client else None
    content_type = request.headers.get("content-type", "")

    # Swagger UI OAuth2 form submission (application/x-www-form-urlencoded)
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        username = form.get("username") or form.get("email") or ""
        password = form.get("password") or ""
        if not username or not password:
            raise HTTPException(status_code=422, detail="Username and password are required.")
        login_payload = UserLogin(email=username, password=password)
        return await service.login(login_payload, ip=ip)

    # Standard JSON API payload (React Frontend & Postman)
    try:
        data = await request.json()
        email = data.get("email") or data.get("username") or ""
        password = data.get("password") or ""
        if not email or not password:
            raise HTTPException(status_code=422, detail="Email/username and password are required.")
        login_payload = UserLogin(email=email, password=password)
        return await service.login(login_payload, ip=ip)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=422, detail="Invalid request body.")
