import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid

router = APIRouter()

# Configuración de Cloudinary
cloudinary.config(
    cloud_name=str(os.getenv("CLOUDINARY_CLOUD_NAME", "")).strip(),
    api_key=str(os.getenv("CLOUDINARY_API_KEY", "")).strip(),
    api_secret=str(os.getenv("CLOUDINARY_API_SECRET", "")).strip(),
    secure=True
)

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """
    Sube un archivo a Cloudinary y devuelve la URL segura.
    """
    try:
        # Leer el contenido del archivo
        file_content = await file.read()
        
        # Subir directamente a Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            public_id=f"portafolio/{uuid.uuid4()}",
            resource_type="auto"
        )

        return {
            "filename": file.filename,
            "url": upload_result.get("secure_url")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo a Cloudinary: {str(e)}")


@router.delete("/delete")
def delete_file(url: str):
    """
    Elimina un archivo de Cloudinary dada su URL.
    """
    try:
        # Extraer el public_id de la URL de Cloudinary
        # Ejemplo: https://res.cloudinary.com/demo/image/upload/v12345/portafolio/public_id.jpg
        # El public_id sería 'portafolio/public_id'
        
        if "cloudinary.com" not in url:
            return {"message": "La URL no pertenece a Cloudinary o ya es local."}

        # Lógica simplificada para obtener el public_id:
        # Buscamos la parte después de 'upload/' (o similar) y quitamos la extensión
        parts = url.split("/")
        # Buscamos el índice que contiene el public_id (generalmente después de la versión 'v12345')
        # Para ser más seguros, tomamos los últimos segmentos que coincidan con nuestra estructura 'portafolio/id'
        public_id_with_ext = "/".join(parts[-2:]) # 'portafolio/uuid.jpg'
        public_id = public_id_with_ext.split(".")[0]

        cloudinary.uploader.destroy(public_id)
        return {"message": f"Archivo {public_id} eliminado de Cloudinary"}
    except Exception as e:
        # No lanzamos error para no romper el flujo si el borrado falla
        return {"message": f"Aviso: No se pudo borrar de Cloudinary: {str(e)}"}
