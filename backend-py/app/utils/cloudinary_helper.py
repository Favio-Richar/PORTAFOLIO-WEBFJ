"""
Utilidad compartida para operaciones de Cloudinary.
Importado por proyectos.py y upload.py.
"""
from app.api.upload import delete_cloudinary_by_url, _extract_public_id

__all__ = ["delete_cloudinary_by_url", "_extract_public_id"]
