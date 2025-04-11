from fastapi import APIRouter
from app.api import auth, verification, upload

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["认证"])
router.include_router(verification.router, prefix="/verification", tags=["身份验证"])
router.include_router(upload.router, prefix="/upload", tags=["文档上传"])

__all__ = ["router"]
