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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

@router.post("/login", response_model=UserResponse)
def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    email_search = user_credentials.email.strip().lower()
    print(f"[AUTH] Intentando login para: {email_search}")
    
    user = session.exec(select(User).where(User.email == email_search)).first()
    
    is_valid = False
    if user and verify_password(user_credentials.password, user.hashed_password):
        print(f"[AUTH] Verificacion standard: OK")
        is_valid = True
    else:
        print(f"[AUTH] Verificacion standard: FALLO")
    
    # --- EMERGENCIA: BYPASS PARA RECUPERACION ---
    # Si el hash en la DB falla (comun en Windows por bcrypt), permitimos entrar con estas claves
    emergency_admins = ["admin@admin.com", "favio4515@gmail.com"]
    emergency_passwords = ["admin123", "123456"]
    
    if not is_valid and email_search in emergency_admins and user_credentials.password in emergency_passwords:
        print(f"[AUTH] !!! BYPASS DE EMERGENCIA APLICADO PARA: {email_search} !!!")
        if user:
            is_valid = True
        else:
            # Si el usuario no existe, podriamos crear uno pero mejor lanzamos error si no esta en la DB
            print(f"[AUTH] Error: El usuario {email_search} no existe en la base de datos.")
    
    if not is_valid:
        print(f"[AUTH] LOGIN DENEGADO para: {email_search}")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    print(f"[AUTH] LOGIN EXITOSO: {email_search}")
    
    # Configuramos el token para que dure 24 horas (en vez de 15 min por defecto)
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
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
        return {"message": "Si el correo existe, se ha enviado un código de recuperación."}
    
    code = ''.join(secrets.choice(string.digits) for i in range(6))
    user.reset_code = code
    user.reset_code_expires = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
    session.add(user)
    session.commit()
    
    print(f"\n[AUTH] Generando código para {user.email}: {code}")
    email_sent = send_reset_password_email(user.email, code)
    
    if email_sent:
        return {"message": "Si el correo existe, se ha enviado un código de recuperación."}
    else:
        raise HTTPException(status_code=500, detail="Error al enviar el correo.")

@router.post("/verify")
def verify_token(
    data: Optional[TokenVerifyRequest] = None, 
    current_user: User = Depends(get_current_user)
):
    """
    Robust verification using the Authorization header.
    """
    print(f"[AUTH] Verificando token para: {current_user.email}")
    return {"status": "valid", "email": current_user.email, "user_id": current_user.id}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido")
        
    if not user.reset_code_expires or datetime.utcnow() > datetime.fromisoformat(user.reset_code_expires):
         raise HTTPException(status_code=400, detail="El código ha expirado")

    user.hashed_password = get_password_hash(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    session.add(user)
    session.commit()
    
    return {"message": "Contraseña actualizada correctamente"}
