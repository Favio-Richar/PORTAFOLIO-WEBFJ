import os
import re
import logging
import uuid
from typing import Dict, List, Optional
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from app.core.admin_auth import require_admin

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuracion de Cloudinary
cloudinary.config(
    cloud_name=str(os.getenv("CLOUDINARY_CLOUD_NAME", "")).strip(),
    api_key=str(os.getenv("CLOUDINARY_API_KEY", "")).strip(),
    api_secret=str(os.getenv("CLOUDINARY_API_SECRET", "")).strip(),
    secure=True,
)

ALLOWED_VIEW_HOSTS = {
    "res.cloudinary.com",
    "localhost",
    "127.0.0.1",
}


def _get_thumbnail_url(url: str, resource_type: str) -> str:
    if not url or "cloudinary.com" not in url:
        return url
    
    # Transformacion: square crop 250x250, auto quality, auto format
    transformation = "w_250,h_250,c_fill,q_auto,f_auto"
    
    if resource_type == "video":
        # Cambiar extension a .jpg para obtener un frame de video y agregar so_auto (start offset auto)
        base_url = re.sub(r"\.[a-zA-Z0-9]+$", ".jpg", url)
        return base_url.replace("/upload/", f"/upload/{transformation},so_auto/")
    
    return url.replace("/upload/", f"/upload/{transformation}/")


def _map_cloudinary_resource(resource: Dict) -> Dict:
    url = resource.get("secure_url") or resource.get("url")
    resource_type = resource.get("resource_type", "image")
    
    return {
        "asset_id": resource.get("asset_id"),
        "public_id": resource.get("public_id"),
        "url": url,
        "thumbnail_url": _get_thumbnail_url(url, resource_type) if url else None,
        "resource_type": resource_type,
        "format": resource.get("format"),
        "bytes": resource.get("bytes"),
        "width": resource.get("width"),
        "height": resource.get("height"),
        "created_at": resource.get("created_at"),
        "folder": resource.get("asset_folder") or resource.get("folder"),
    }


def _list_cloudinary_resources(
    *,
    limit: int,
    resource_types: List[str],
    prefix: Optional[str] = None,
) -> List[Dict]:
    items: List[Dict] = []
    seen_urls = set()

    for resource_type in resource_types:
        next_cursor = None

        while len(items) < limit:
            remaining = limit - len(items)
            if remaining <= 0:
                break

            params: Dict = {
                "resource_type": resource_type,
                "type": "upload",
                "max_results": min(100, remaining),
            }
            if next_cursor:
                params["next_cursor"] = next_cursor
            if prefix:
                params["prefix"] = prefix

            response = cloudinary.api.resources(**params)
            batch = response.get("resources", []) or []

            for resource in batch:
                mapped = _map_cloudinary_resource(resource)
                url = str(mapped.get("url") or "").strip()
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                items.append(mapped)
                if len(items) >= limit:
                    break

            next_cursor = response.get("next_cursor")
            if not next_cursor:
                break

    items.sort(key=lambda item: str(item.get("created_at") or ""), reverse=True)
    return items[:limit]


def _extract_public_id(url: str) -> Optional[str]:
    """
    Extrae el public_id de una URL de Cloudinary de forma robusta.
    Ejemplos:
      https://res.cloudinary.com/demo/image/upload/v1234/portafolio/uuid.jpg -> portafolio/uuid
      https://res.cloudinary.com/demo/video/upload/portafolio/video.mp4 -> portafolio/video
    """
    if not url or "cloudinary.com" not in url:
        return None

    # Patron: buscar la parte despues de /upload/ (con o sin version)
    match = re.search(r"/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$", url)
    if match:
        return match.group(1)

    # Fallback manual: tomar los segmentos despues de upload
    try:
        parts = url.split("/")
        if "upload" in parts:
            upload_idx = parts.index("upload")
            after_upload = parts[upload_idx + 1:]
            if after_upload and re.match(r"^v\d+$", after_upload[0]):
                after_upload = after_upload[1:]
            if after_upload:
                public_id_with_ext = "/".join(after_upload)
                return re.sub(r"\.[a-zA-Z0-9]+$", "", public_id_with_ext)
    except Exception:
        pass

    return None


def delete_cloudinary_by_url(url: str, resource_type: str = "image") -> bool:
    """
    Elimina un recurso de Cloudinary dado su URL.
    Retorna True si se elimino correctamente.
    """
    public_id = _extract_public_id(url)
    if not public_id:
        logger.warning("No se pudo extraer public_id de: %s", url)
        return False

    valid_types = {"image", "video", "raw"}
    if resource_type not in valid_types:
        resource_type = "image"

    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)
        success = result.get("result") == "ok"
        if success:
            logger.info("Eliminado de Cloudinary: %s (%s)", public_id, resource_type)
        else:
            logger.warning("Cloudinary no encontro: %s - resultado: %s", public_id, result.get("result"))
        return success
    except Exception as exc:
        logger.error("Error eliminando %s de Cloudinary: %s", public_id, exc)
        return False


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(require_admin),
):
    """
    Sube un archivo a Cloudinary y devuelve la URL segura.
    Detecta automaticamente si es imagen o video.
    """
    try:
        file_content = await file.read()

        content_type = file.content_type or ""
        if content_type == "application/pdf":
            resource_type = "raw"
        elif content_type.startswith("video/"):
            resource_type = "video"
        else:
            resource_type = "image"

        upload_result = cloudinary.uploader.upload(
            file_content,
            public_id=f"portafolio/{uuid.uuid4()}",
            resource_type=resource_type,
            overwrite=False,
        )

        return {
            "filename": file.filename,
            "url": upload_result.get("secure_url"),
            "resource_type": upload_result.get("resource_type", resource_type),
            "public_id": upload_result.get("public_id"),
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),
            "height": upload_result.get("height"),
            "bytes": upload_result.get("bytes"),
        }
    except Exception as exc:
        logger.error("Error subiendo archivo a Cloudinary: %s", exc)
        raise HTTPException(status_code=500, detail=f"Error al subir archivo a Cloudinary: {str(exc)}")


@router.get("/library")
def list_cloudinary_library(
    limit: int = Query(200, ge=1, le=500),
    include_raw: bool = Query(False, description="Incluir archivos RAW de Cloudinary"),
    prefix: Optional[str] = Query(None, description="Filtrar por prefijo public_id, ej: portafolio/"),
    current_user=Depends(require_admin),
):
    """
    Lista recursos desde Cloudinary Admin API para poblar biblioteca multimedia en admin.
    """
    try:
        configured = all(
            [
                str(os.getenv("CLOUDINARY_CLOUD_NAME", "")).strip(),
                str(os.getenv("CLOUDINARY_API_KEY", "")).strip(),
                str(os.getenv("CLOUDINARY_API_SECRET", "")).strip(),
            ]
        )
        if not configured:
            raise HTTPException(status_code=500, detail="Cloudinary no esta configurado en el backend.")

        resource_types = ["image", "video"]
        if include_raw:
            resource_types.append("raw")

        resources = _list_cloudinary_resources(limit=limit, resource_types=resource_types, prefix=prefix)
        return {"items": resources, "count": len(resources)}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error listando biblioteca de Cloudinary: %s", exc)
        raise HTTPException(status_code=502, detail=f"No se pudo consultar Cloudinary: {str(exc)}")


@router.delete("/delete")
def delete_file(
    url: str = Query(..., description="URL del archivo en Cloudinary a eliminar"),
    current_user=Depends(require_admin),
):
    """
    Elimina un archivo de Cloudinary dada su URL.
    Detecta automaticamente si es imagen o video.
    No lanza error si el borrado falla para no bloquear el flujo del cliente.
    """
    try:
        if "cloudinary.com" not in url:
            return {"message": "La URL no pertenece a Cloudinary o ya es local.", "deleted": False}

        if re.search(r"\.(pdf)(\?|$)", url, re.IGNORECASE):
            resource_type = "raw"
        elif re.search(r"\.(mp4|webm|ogg|mov|avi)(\?|$)", url, re.IGNORECASE):
            resource_type = "video"
        else:
            resource_type = "image"

        public_id = _extract_public_id(url)
        if not public_id:
            return {"message": "No se pudo extraer public_id de la URL.", "deleted": False}

        success = delete_cloudinary_by_url(url, resource_type)
        if success:
            return {"message": f"Archivo {public_id} eliminado de Cloudinary", "deleted": True}
        return {"message": f"No se encontro {public_id} en Cloudinary (puede que ya este eliminado).", "deleted": False}
    except Exception as exc:
        logger.error("Error al borrar de Cloudinary: %s", exc)
        return {"message": f"Aviso: No se pudo borrar de Cloudinary: {str(exc)}", "deleted": False}


@router.get("/view")
def view_file(url: str = Query(..., description="URL del archivo a mostrar inline")):
    """
    Proxy para visualizar archivos (especialmente PDFs raw de Cloudinary) dentro de iframes.
    Fuerza Content-Type application/pdf cuando detecta firma PDF (%PDF).
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            raise HTTPException(status_code=400, detail="URL invalida")
        if parsed.hostname not in ALLOWED_VIEW_HOSTS:
            raise HTTPException(status_code=400, detail="Host no permitido para visualizacion")

        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=25) as remote:
            payload = remote.read()
            header_content_type = (remote.headers.get("Content-Type") or "").lower()
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error obteniendo archivo remoto para vista: %s", exc)
        raise HTTPException(status_code=502, detail="No se pudo obtener el archivo remoto")

    is_pdf = payload.startswith(b"%PDF")
    if is_pdf:
        media_type = "application/pdf"
        filename = "certificado.pdf"
    elif "image/" in header_content_type:
        media_type = header_content_type.split(";")[0]
        filename = "certificado"
    elif "video/" in header_content_type:
        media_type = header_content_type.split(";")[0]
        filename = "certificado"
    else:
        media_type = "application/octet-stream"
        filename = "certificado"

    return Response(
        content=payload,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    )
