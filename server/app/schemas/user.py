from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, example="Alex Rivera")
    email: EmailStr = Field(..., example="alex@campus.edu")
    password: str = Field(..., min_length=6, example="SecurePass123!")
    college: Optional[str] = Field(None, example="Stanford University")
    degree: Optional[str] = Field(None, example="B.S. Computer Science")
    graduationYear: Optional[int] = Field(None, example=2026)
    skills: List[str] = Field(default_factory=list, example=["Python", "React", "SQL"])

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 bytes in UTF-8 encoding.")
        return v

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="alex@campus.edu")
    password: str = Field(..., example="SecurePass123!")

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    college: Optional[str] = None
    degree: Optional[str] = None
    graduationYear: Optional[int] = None
    skills: List[str] = []
    createdAt: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
