import os
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

# --- CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-it")  # Should come from .env
if SECRET_KEY == "your-secret-key-change-it":
    print("[SECURITY] WARNING: SECRET_KEY is using the default value. Configure SECRET_KEY in .env for production.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day


def is_default_secret_key() -> bool:
    return SECRET_KEY == "your-secret-key-change-it"


def is_strict_production_mode() -> bool:
    return os.getenv("SECURITY_STRICT_MODE", "").strip().lower() == "true"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
