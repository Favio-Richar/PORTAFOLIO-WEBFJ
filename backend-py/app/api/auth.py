from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db import get_session
from app.models import User
from app.core.security import get_password_hash, verify_password, create_access_token, ALGORITHM, SECRET_KEY
from jose import jwt, JWTError
from app.core.email import send_reset_password_email
from pydantic import BaseModel
from typing import Optional
import secrets
import string
from datetime import datetime, timedelta

from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user

# --- SCHEMAS ---
class TokenVerifyRequest(BaseModel):
    token: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    access_token: str
    token_type: str

class PasswordRecoveryRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    code: str
    new_password: str

# --- ENDPOINTS ---

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, session: Session = Depends(get_session)):
    # --- REGISTRO DESHABILITADO ---
    raise HTTPException(status_code=403, detail="El registro de nuevos usuarios está deshabilitado.")

    # existing_user = session.exec(select(User).where(User.email == user.email)).first()
    # if existing_user:
    #     raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # hashed_password = get_password_hash(user.password)
    # new_user = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    # session.add(new_user)
    # session.commit()
    # session.refresh(new_user)
    
    # access_token = create_access_token(data={"sub": new_user.email})
    
    # return {
    #     "id": new_user.id,
    #     "email": new_user.email,
    #     "full_name": new_user.full_name,
    #     "access_token": access_token,
    #     "token_type": "bearer"
    # }

@router.post("/login", response_model=UserResponse)
def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_credentials.email)).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/recover-password")
def recover_password(request: PasswordRecoveryRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    if not user:
        # Por seguridad, no decimos si el email existe o no
        return {"message": "Si el correo existe, se ha enviado un código de recuperación."}
    
    # Generar código de 6 dígitos
    code = ''.join(secrets.choice(string.digits) for i in range(6))
    
    # Guardar en DB con expiración (15 minutos)
    user.reset_code = code
    user.reset_code_expires = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    session.add(user)
    session.commit()
    
    # Enviar Email
    print(f"\n[AUTH] Generando código para {user.email}: {code}")
    
    email_sent = send_reset_password_email(user.email, code)
    
    if email_sent:
        print(f"[AUTH] Email enviado exitosamente a {user.email}")
        return {"message": "Si el correo existe, se ha enviado un código de recuperación."}
    else:
        print(f"[AUTH] ERROR: No se pudo enviar el correo a {user.email}")
        # En desarrollo real, queremos saber que falló
        raise HTTPException(
            status_code=500, 
            detail="Error al enviar el correo. Revisa la configuración de Resend."
        )

@router.post("/verify")
def verify_token(data: TokenVerifyRequest):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return {"status": "valid", "email": email}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido")
        
    # Verificar expiración
    if not user.reset_code_expires or datetime.utcnow() > datetime.fromisoformat(user.reset_code_expires):
         raise HTTPException(status_code=400, detail="El código ha expirado")

    # Actualizar contraseña
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    session.add(user)
    session.commit()
    
    return {"message": "Contraseña actualizada correctamente"}
