from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from services.api.auth import create_access_token, verify_password, get_current_user
from services.api.users_service import create_user, get_user_with_password_by_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(email: str, password: str):
    try:
        return create_user(email=email, password=password)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_with_password_by_email(form_data.username)

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user["id"])})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return current_user
