"""
Files Router (serve uploaded files)
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
import os

from app.core.config import settings

router = APIRouter()


@router.get("/{path:path}")
async def serve_file(path: str):
    """
    Shërben file nga uploads directory
    """
    # Security: prevent directory traversal
    if ".." in path or path.startswith("/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid path"
        )

    file_path = os.path.join(settings.UPLOAD_DIR, path)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File nuk u gjet"
        )

    return FileResponse(file_path)