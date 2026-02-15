"""
Crear tabla de casos completos si no existe.

Uso:
  python migrate_casos_completos.py
"""

from sqlmodel import SQLModel

from app.db import engine
from app.models import CasoExitoCompleto


def run():
    SQLModel.metadata.create_all(engine, tables=[CasoExitoCompleto.__table__])
    print("[OK] Tabla casoexitocompleto verificada/creada.")


if __name__ == "__main__":
    run()
