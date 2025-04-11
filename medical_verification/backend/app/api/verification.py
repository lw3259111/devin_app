from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.models import (
    User, 
    VerificationRequest, 
    VerificationRequestCreate, 
    VerificationStatus,
    RiskLevel,
    IDCardVerification,
    FaceVerification,
    WorkBadgeVerification,
    BankCardVerification,
    VerificationStats
)
from app.auth import get_current_active_user
from app.database import db
from datetime import datetime

router = APIRouter()

@router.post("/requests", response_model=VerificationRequest)
async def create_verification_request(
    request_data: VerificationRequestCreate,
    current_user: User = Depends(get_current_active_user)
):
    """创建新的医生身份验证请求"""
    return db.create_verification_request(request_data, current_user.id)

@router.get("/requests", response_model=List[VerificationRequest])
async def get_verification_requests(
    status: Optional[VerificationStatus] = None,
    risk_level: Optional[RiskLevel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """获取验证请求列表，可按状态和风险等级筛选"""
    return db.get_verification_requests(status, risk_level, skip, limit)

@router.get("/requests/{request_id}", response_model=VerificationRequest)
async def get_verification_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """获取特定验证请求的详细信息"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    return verification_request

@router.put("/requests/{request_id}/id-card", response_model=IDCardVerification)
async def update_id_card_verification(
    request_id: int,
    verification_data: IDCardVerification,
    current_user: User = Depends(get_current_active_user)
):
    """更新身份证验证结果"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    return db.update_id_card_verification(request_id, verification_data, current_user.id)

@router.put("/requests/{request_id}/face", response_model=FaceVerification)
async def update_face_verification(
    request_id: int,
    verification_data: FaceVerification,
    current_user: User = Depends(get_current_active_user)
):
    """更新人脸验证结果"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    return db.update_face_verification(request_id, verification_data, current_user.id)

@router.put("/requests/{request_id}/work-badge", response_model=WorkBadgeVerification)
async def update_work_badge_verification(
    request_id: int,
    verification_data: WorkBadgeVerification,
    current_user: User = Depends(get_current_active_user)
):
    """更新工作证验证结果"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    return db.update_work_badge_verification(request_id, verification_data, current_user.id)

@router.put("/requests/{request_id}/bank-card", response_model=BankCardVerification)
async def update_bank_card_verification(
    request_id: int,
    verification_data: BankCardVerification,
    current_user: User = Depends(get_current_active_user)
):
    """更新银行卡验证结果"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    return db.update_bank_card_verification(request_id, verification_data, current_user.id)

@router.put("/requests/{request_id}/status", response_model=VerificationRequest)
async def update_verification_status(
    request_id: int,
    status: VerificationStatus,
    risk_level: Optional[RiskLevel] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """更新验证请求的整体状态"""
    verification_request = db.get_verification_request(request_id)
    if not verification_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="验证请求不存在"
        )
    
    return db.update_verification_status(
        request_id, 
        status, 
        risk_level, 
        notes, 
        current_user.id
    )

@router.get("/stats", response_model=VerificationStats)
async def get_verification_stats(
    current_user: User = Depends(get_current_active_user)
):
    """获取验证统计数据"""
    return db.get_verification_stats()
