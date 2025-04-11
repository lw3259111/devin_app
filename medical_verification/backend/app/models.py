from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime


class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class UserBase(BaseModel):
    email: str
    username: str
    full_name: str
    role: str = "verifier"


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class IDCardVerification(BaseModel):
    id_number: str
    name: str
    gender: str
    nationality: str
    address: str
    birth_date: str
    issue_date: str
    expiry_date: str
    issuing_authority: str
    ocr_confidence: float = Field(ge=0.0, le=1.0)
    verification_status: VerificationStatus = VerificationStatus.PENDING
    risk_level: RiskLevel = RiskLevel.MEDIUM
    verification_notes: Optional[str] = None


class FaceVerification(BaseModel):
    face_match_score: float = Field(ge=0.0, le=1.0)
    liveness_score: float = Field(ge=0.0, le=1.0)
    verification_status: VerificationStatus = VerificationStatus.PENDING
    risk_level: RiskLevel = RiskLevel.MEDIUM
    verification_notes: Optional[str] = None


class WorkBadgeVerification(BaseModel):
    badge_id: str
    hospital_name: str
    department: str
    position: str
    issue_date: str
    expiry_date: Optional[str] = None
    ocr_confidence: float = Field(ge=0.0, le=1.0)
    verification_status: VerificationStatus = VerificationStatus.PENDING
    risk_level: RiskLevel = RiskLevel.MEDIUM
    verification_notes: Optional[str] = None


class BankCardVerification(BaseModel):
    card_number_last_four: str
    bank_name: str
    card_type: str
    verification_status: VerificationStatus = VerificationStatus.PENDING
    risk_level: RiskLevel = RiskLevel.MEDIUM
    verification_notes: Optional[str] = None


class VerificationRequest(BaseModel):
    id: int
    doctor_id: int
    id_card: Optional[IDCardVerification] = None
    face: Optional[FaceVerification] = None
    work_badge: Optional[WorkBadgeVerification] = None
    bank_card: Optional[BankCardVerification] = None
    overall_status: VerificationStatus = VerificationStatus.PENDING
    overall_risk_level: RiskLevel = RiskLevel.MEDIUM
    created_at: datetime
    updated_at: datetime
    verified_by: Optional[int] = None
    
    class Config:
        from_attributes = True


class VerificationRequestCreate(BaseModel):
    doctor_id: int


class VerificationStats(BaseModel):
    total_requests: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    needs_review_requests: int
    average_processing_time: float  # in hours
