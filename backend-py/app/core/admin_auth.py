import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.core.security import ALGORITHM, SECRET_KEY
from app.db import get_session
from app.models import User

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    session: Session = Depends(get_session),
):
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_admin(current_user: Optional[User] = Depends(get_current_user_optional)):
    """
    Compatibilidad:
    - Si ADMIN_REQUIRE_AUTH=true, exige autenticacion.
    - Si SECURITY_STRICT_MODE=true, tambien exige autenticacion aunque
      ADMIN_REQUIRE_AUTH no este definido.
    """
    admin_auth_required = (
        os.getenv("ADMIN_REQUIRE_AUTH", "").strip().lower() == "true"
        or os.getenv("SECURITY_STRICT_MODE", "").strip().lower() == "true"
    )
    if admin_auth_required and not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticacion requerida",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
