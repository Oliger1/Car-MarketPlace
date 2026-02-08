"""
Auth Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID


class UserRegister(BaseModel):
    """Registration request"""
    company_name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    city: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=50)


class UserLogin(BaseModel):
    """Login request"""
    email: EmailStr
    password: str


class ForgotPassword(BaseModel):
    """Forgot password request"""
    email: EmailStr


class ResetPassword(BaseModel):
    """Reset password request"""
    token: str
    new_password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    """User response"""
    id: UUID
    company_id: UUID
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Login response"""
    user: UserResponse
    message: str = "Hyrje e suksesshme"