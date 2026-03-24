from sqlmodel import Session, select
from app.models import GlobalSetting

def get_setting_value(session: Session, key: str, default: str) -> str:
    """
    Recupera un valor de configuración de la base de datos.
    Si no existe, retorna el valor por defecto.
    """
    try:
        statement = select(GlobalSetting).where(GlobalSetting.key == key)
        setting = session.exec(statement).first()
        if setting:
            return setting.value
    except Exception as e:
        # En caso de error (ej: tabla no existe aún), retornamos el default
        print(f"[SETTINGS] Error recuperando '{key}': {e}")
    
    return default
