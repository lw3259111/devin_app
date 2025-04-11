from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
from app.models import User, VerificationRequest
from app.auth import get_current_active_user
from app.database import db
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ID_CARD_DIR = UPLOAD_DIR / "id_cards"
FACE_DIR = UPLOAD_DIR / "faces"
WORK_BADGE_DIR = UPLOAD_DIR / "work_badges"
BANK_CARD_DIR = UPLOAD_DIR / "bank_cards"

ID_CARD_DIR.mkdir(exist_ok=True)
FACE_DIR.mkdir(exist_ok=True)
WORK_BADGE_DIR.mkdir(exist_ok=True)
BANK_CARD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"]
ALLOWED_DOCUMENT_TYPES = ["image/jpeg", "image/png", "application/pdf"]

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/id-card/{request_id}")
async def upload_id_card(
    request_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """上传身份证照片"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {file.content_type}，请上传 JPG, PNG 或 PDF 文件"
        )
    
    file_size = 0
    contents = await file.read(MAX_FILE_SIZE + 1)
    file_size = len(contents)
    await file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制: {file_size} 字节，最大允许 {MAX_FILE_SIZE} 字节 (5MB)"
        )
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{request_id}_{uuid.uuid4()}.{file_extension}"
    file_path = ID_CARD_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    analysis_result = {
        "id_number": "110101199001011234",
        "name": "张三",
        "gender": "男",
        "nationality": "汉族",
        "address": "北京市海淀区中关村南大街5号",
        "birth_date": "1990-01-01",
        "issue_date": "2015-01-01",
        "expiry_date": "2035-01-01",
        "issuing_authority": "北京市公安局海淀分局",
        "ocr_confidence": 0.95,
        "verification_status": "pending",
        "risk_level": "low",
    }
    
    db.update_id_card_verification(request_id, analysis_result, current_user.id)
    
    return {
        "filename": unique_filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "analysis_result": analysis_result
    }

@router.post("/face/{request_id}")
async def upload_face(
    request_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """上传人脸照片"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {file.content_type}，请上传 JPG 或 PNG 文件"
        )
    
    file_size = 0
    contents = await file.read(MAX_FILE_SIZE + 1)
    file_size = len(contents)
    await file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制: {file_size} 字节，最大允许 {MAX_FILE_SIZE} 字节 (5MB)"
        )
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{request_id}_{uuid.uuid4()}.{file_extension}"
    file_path = FACE_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    analysis_result = {
        "face_match_score": 0.92,
        "liveness_score": 0.98,
        "verification_status": "pending",
        "risk_level": "low",
    }
    
    db.update_face_verification(request_id, analysis_result, current_user.id)
    
    return {
        "filename": unique_filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "analysis_result": analysis_result
    }

@router.post("/work-badge/{request_id}")
async def upload_work_badge(
    request_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """上传工作证照片"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {file.content_type}，请上传 JPG, PNG 或 PDF 文件"
        )
    
    file_size = 0
    contents = await file.read(MAX_FILE_SIZE + 1)
    file_size = len(contents)
    await file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制: {file_size} 字节，最大允许 {MAX_FILE_SIZE} 字节 (5MB)"
        )
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{request_id}_{uuid.uuid4()}.{file_extension}"
    file_path = WORK_BADGE_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    analysis_result = {
        "badge_id": "BJ12345",
        "hospital_name": "北京协和医院",
        "department": "心脏内科",
        "position": "主任医师",
        "issue_date": "2020-01-01",
        "expiry_date": "2025-01-01",
        "ocr_confidence": 0.90,
        "verification_status": "pending",
        "risk_level": "low",
    }
    
    db.update_work_badge_verification(request_id, analysis_result, current_user.id)
    
    return {
        "filename": unique_filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "analysis_result": analysis_result
    }

@router.post("/bank-card/{request_id}")
async def upload_bank_card(
    request_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """上传银行卡照片"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {file.content_type}，请上传 JPG 或 PNG 文件"
        )
    
    file_size = 0
    contents = await file.read(MAX_FILE_SIZE + 1)
    file_size = len(contents)
    await file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制: {file_size} 字节，最大允许 {MAX_FILE_SIZE} 字节 (5MB)"
        )
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{request_id}_{uuid.uuid4()}.{file_extension}"
    file_path = BANK_CARD_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    analysis_result = {
        "card_number_last_four": "1234",
        "bank_name": "中国建设银行",
        "card_type": "借记卡",
        "verification_status": "pending",
        "risk_level": "low",
    }
    
    db.update_bank_card_verification(request_id, analysis_result, current_user.id)
    
    return {
        "filename": unique_filename,
        "content_type": file.content_type,
        "file_size": file_size,
        "analysis_result": analysis_result
    }
