import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.user_service import get_user_by_email, get_user_by_id, create_user, _format_user_doc
from app.services.security import verify_password, create_access_token, decode_access_token

logger = logging.getLogger("campusmate.routes.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Dependency to extract and validate JWT token from Bearer header."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.get("status") == "Disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled. Please contact the administrator."
        )
    
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserRegister):
    """Registers a new student account in MongoDB Atlas and returns JWT access token."""
    email_clean = user_in.email.strip().lower()
    logger.info(f"Registration endpoint reached for email: {email_clean}")
    
    existing = await get_user_by_email(user_in.email)
    if existing:
        logger.warning(f"Registration failed: account with email {email_clean} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    new_user = await create_user(user_in)
    user_id = str(new_user.get("_id", new_user.get("id")))
    
    # Generate JWT Token
    access_token = create_access_token(data={"sub": user_id, "email": new_user["email"], "role": "student"})
    
    formatted_user = UserResponse(**_format_user_doc(new_user))
    logger.info(f"Registration request fulfilled successfully: user_id={user_id}")
    return TokenResponse(access_token=access_token, user=formatted_user)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login_user(credentials: UserLogin):
    """Authenticates user email and password, returning JWT access token."""
    user = await get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
    
    if user.get("status") == "Disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled. Please contact the administrator."
        )
    
    if not verify_password(credentials.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
    
    user_id = str(user.get("_id", user.get("id")))
    access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": "student"})
    
    formatted_user = UserResponse(**_format_user_doc(user))
    return TokenResponse(access_token=access_token, user=formatted_user)

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns profile information for authenticated user."""
    return UserResponse(**_format_user_doc(current_user))
