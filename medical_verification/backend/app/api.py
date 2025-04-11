from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
from datetime import datetime, timedelta
import json
import random
from app.models import (
    User, Token, VerificationRequest, VerificationRequestCreate,
    IDCardVerification, FaceVerification, WorkBadgeVerification, BankCardVerification,
    VerificationStatus, RiskLevel, VerificationStats
)
from app.auth import authenticate_user, create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import db

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/verification-requests", response_model=List[VerificationRequest])
async def get_verification_requests(
    status: Optional[VerificationStatus] = None,
    current_user: User = Depends(get_current_active_user)
):
    if status:
        return db.get_verification_requests_by_status(status)
    return db.get_all_verification_requests()

@router.get("/verification-requests/{request_id}", response_model=VerificationRequest)
async def get_verification_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    return request

@router.post("/verification-requests", response_model=VerificationRequest)
async def create_verification_request(
    request_data: VerificationRequestCreate,
    current_user: User = Depends(get_current_active_user)
):
    new_request = VerificationRequest(
        id=0,  # Will be set by the database
        doctor_id=request_data.doctor_id,
        id_card=None,
        face=None,
        work_badge=None,
        bank_card=None,
        overall_status=VerificationStatus.PENDING,
        overall_risk_level=RiskLevel.MEDIUM,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        verified_by=None
    )
    return db.create_verification_request(new_request)

@router.post("/verification-requests/{request_id}/id-card", response_model=IDCardVerification)
async def upload_id_card(
    request_id: int,
    id_card_file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    
    id_card = IDCardVerification(
        id_number=f"1234{random.randint(10000000, 99999999)}",
        name="张医生",
        gender="男" if random.random() > 0.5 else "女",
        nationality="汉族",
        address="北京市海淀区医院路" + str(random.randint(1, 999)) + "号",
        birth_date=f"19{random.randint(60, 99)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        issue_date=f"20{random.randint(10, 20)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        expiry_date=f"20{random.randint(25, 40)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        issuing_authority="北京市公安局",
        ocr_confidence=round(random.uniform(0.85, 0.99), 2),
        verification_status=VerificationStatus.PENDING,
        risk_level=RiskLevel.LOW if random.random() > 0.2 else RiskLevel.MEDIUM,
        verification_notes=None
    )
    
    request.id_card = id_card
    request.updated_at = datetime.now()
    
    update_overall_status_and_risk(request)
    
    db.update_verification_request(request_id, request)
    return id_card

@router.post("/verification-requests/{request_id}/face", response_model=FaceVerification)
async def upload_face(
    request_id: int,
    face_file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    
    face = FaceVerification(
        face_match_score=round(random.uniform(0.75, 0.99), 2),
        liveness_score=round(random.uniform(0.80, 0.99), 2),
        verification_status=VerificationStatus.PENDING,
        risk_level=RiskLevel.LOW if random.random() > 0.2 else RiskLevel.MEDIUM,
        verification_notes=None
    )
    
    request.face = face
    request.updated_at = datetime.now()
    
    update_overall_status_and_risk(request)
    
    db.update_verification_request(request_id, request)
    return face

@router.post("/verification-requests/{request_id}/work-badge", response_model=WorkBadgeVerification)
async def upload_work_badge(
    request_id: int,
    work_badge_file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    
    hospitals = ["北京协和医院", "北京大学第一医院", "中国医学科学院肿瘤医院", "北京天坛医院"]
    departments = ["心脏内科", "神经外科", "肿瘤科", "儿科", "妇产科", "急诊科"]
    positions = ["主任医师", "副主任医师", "主治医师", "住院医师"]
    
    work_badge = WorkBadgeVerification(
        badge_id=f"HOSP{random.randint(10000, 99999)}",
        hospital_name=random.choice(hospitals),
        department=random.choice(departments),
        position=random.choice(positions),
        issue_date=f"20{random.randint(15, 22)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        expiry_date=f"20{random.randint(23, 30)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        ocr_confidence=round(random.uniform(0.80, 0.95), 2),
        verification_status=VerificationStatus.PENDING,
        risk_level=RiskLevel.LOW if random.random() > 0.3 else RiskLevel.MEDIUM,
        verification_notes=None
    )
    
    request.work_badge = work_badge
    request.updated_at = datetime.now()
    
    update_overall_status_and_risk(request)
    
    db.update_verification_request(request_id, request)
    return work_badge

@router.post("/verification-requests/{request_id}/bank-card", response_model=BankCardVerification)
async def upload_bank_card(
    request_id: int,
    bank_card_file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    
    banks = ["中国工商银行", "中国建设银行", "中国农业银行", "中国银行", "招商银行"]
    card_types = ["借记卡", "信用卡"]
    
    bank_card = BankCardVerification(
        card_number_last_four=f"{random.randint(1000, 9999)}",
        bank_name=random.choice(banks),
        card_type=random.choice(card_types),
        verification_status=VerificationStatus.PENDING,
        risk_level=RiskLevel.LOW if random.random() > 0.2 else RiskLevel.MEDIUM,
        verification_notes=None
    )
    
    request.bank_card = bank_card
    request.updated_at = datetime.now()
    
    update_overall_status_and_risk(request)
    
    db.update_verification_request(request_id, request)
    return bank_card

@router.put("/verification-requests/{request_id}/verify", response_model=VerificationRequest)
async def verify_request(
    request_id: int,
    status: VerificationStatus,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    request = db.get_verification_request(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="验证请求未找到")
    
    request.overall_status = status
    request.updated_at = datetime.now()
    request.verified_by = current_user.id
    
    if notes:
        if request.id_card:
            request.id_card.verification_notes = notes
        if request.face:
            request.face.verification_notes = notes
        if request.work_badge:
            request.work_badge.verification_notes = notes
        if request.bank_card:
            request.bank_card.verification_notes = notes
    
    db.update_verification_request(request_id, request)
    return request

@router.get("/statistics", response_model=VerificationStats)
async def get_statistics(current_user: User = Depends(get_current_active_user)):
    all_requests = db.get_all_verification_requests()
    
    total = len(all_requests)
    pending = len([r for r in all_requests if r.overall_status == VerificationStatus.PENDING])
    approved = len([r for r in all_requests if r.overall_status == VerificationStatus.APPROVED])
    rejected = len([r for r in all_requests if r.overall_status == VerificationStatus.REJECTED])
    needs_review = len([r for r in all_requests if r.overall_status == VerificationStatus.NEEDS_REVIEW])
    
    completed_requests = [r for r in all_requests if r.overall_status in [VerificationStatus.APPROVED, VerificationStatus.REJECTED]]
    if completed_requests:
        total_hours = sum([(r.updated_at - r.created_at).total_seconds() / 3600 for r in completed_requests])
        avg_time = total_hours / len(completed_requests)
    else:
        avg_time = 0.0
    
    return VerificationStats(
        total_requests=total,
        pending_requests=pending,
        approved_requests=approved,
        rejected_requests=rejected,
        needs_review_requests=needs_review,
        average_processing_time=round(avg_time, 2)
    )

def update_overall_status_and_risk(request: VerificationRequest):
    if (request.id_card and request.id_card.risk_level == RiskLevel.HIGH) or \
       (request.face and request.face.risk_level == RiskLevel.HIGH) or \
       (request.work_badge and request.work_badge.risk_level == RiskLevel.HIGH) or \
       (request.bank_card and request.bank_card.risk_level == RiskLevel.HIGH):
        request.overall_risk_level = RiskLevel.HIGH
        request.overall_status = VerificationStatus.NEEDS_REVIEW
    elif (request.id_card and request.id_card.risk_level == RiskLevel.MEDIUM) or \
         (request.face and request.face.risk_level == RiskLevel.MEDIUM) or \
         (request.work_badge and request.work_badge.risk_level == RiskLevel.MEDIUM) or \
         (request.bank_card and request.bank_card.risk_level == RiskLevel.MEDIUM):
        request.overall_risk_level = RiskLevel.MEDIUM
    else:
        request.overall_risk_level = RiskLevel.LOW
