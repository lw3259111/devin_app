from datetime import datetime
from typing import Dict, List, Optional
from app.models import (
    User, VerificationRequest, IDCardVerification, FaceVerification,
    WorkBadgeVerification, BankCardVerification, VerificationStatus, RiskLevel
)

class Database:
    def __init__(self):
        self.users: Dict[int, User] = {}
        self.verification_requests: Dict[int, VerificationRequest] = {}
        self.next_user_id = 1
        self.next_request_id = 1
        
        self._add_sample_data()
    
    def _add_sample_data(self):
        admin_user = User(
            id=self.next_user_id,
            email="admin@hospital.com",
            username="admin",
            full_name="Admin User",
            role="admin",
            is_active=True,
            created_at=datetime.now()
        )
        self.users[self.next_user_id] = admin_user
        self.next_user_id += 1
        
        verifier_user = User(
            id=self.next_user_id,
            email="verifier@hospital.com",
            username="verifier",
            full_name="Verification Staff",
            role="verifier",
            is_active=True,
            created_at=datetime.now()
        )
        self.users[self.next_user_id] = verifier_user
        self.next_user_id += 1
        
        sample_request = VerificationRequest(
            id=self.next_request_id,
            doctor_id=3,  # Imaginary doctor ID
            id_card=IDCardVerification(
                id_number="123456789012345678",
                name="张医生",
                gender="男",
                nationality="汉族",
                address="北京市海淀区医院路123号",
                birth_date="1980-01-01",
                issue_date="2015-01-01",
                expiry_date="2035-01-01",
                issuing_authority="北京市公安局",
                ocr_confidence=0.95,
                verification_status=VerificationStatus.PENDING,
                risk_level=RiskLevel.LOW,
                verification_notes=None
            ),
            face=FaceVerification(
                face_match_score=0.92,
                liveness_score=0.98,
                verification_status=VerificationStatus.PENDING,
                risk_level=RiskLevel.LOW,
                verification_notes=None
            ),
            work_badge=WorkBadgeVerification(
                badge_id="HOSP12345",
                hospital_name="北京协和医院",
                department="心脏内科",
                position="主任医师",
                issue_date="2020-01-01",
                expiry_date="2025-01-01",
                ocr_confidence=0.88,
                verification_status=VerificationStatus.PENDING,
                risk_level=RiskLevel.MEDIUM,
                verification_notes=None
            ),
            bank_card=BankCardVerification(
                card_number_last_four="6789",
                bank_name="中国建设银行",
                card_type="借记卡",
                verification_status=VerificationStatus.PENDING,
                risk_level=RiskLevel.LOW,
                verification_notes=None
            ),
            overall_status=VerificationStatus.PENDING,
            overall_risk_level=RiskLevel.MEDIUM,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            verified_by=None
        )
        self.verification_requests[self.next_request_id] = sample_request
        self.next_request_id += 1
    
    def get_user(self, user_id: int) -> Optional[User]:
        return self.users.get(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        for user in self.users.values():
            if user.username == username:
                return user
        return None
    
    def create_user(self, user: User) -> User:
        user.id = self.next_user_id
        user.created_at = datetime.now()
        self.users[self.next_user_id] = user
        self.next_user_id += 1
        return user
    
    def get_all_users(self) -> List[User]:
        return list(self.users.values())
    
    def get_verification_request(self, request_id: int) -> Optional[VerificationRequest]:
        return self.verification_requests.get(request_id)
    
    def create_verification_request(self, request: VerificationRequest) -> VerificationRequest:
        request.id = self.next_request_id
        request.created_at = datetime.now()
        request.updated_at = datetime.now()
        self.verification_requests[self.next_request_id] = request
        self.next_request_id += 1
        return request
    
    def update_verification_request(self, request_id: int, updated_request: VerificationRequest) -> Optional[VerificationRequest]:
        if request_id not in self.verification_requests:
            return None
        
        updated_request.updated_at = datetime.now()
        self.verification_requests[request_id] = updated_request
        return updated_request
    
    def get_all_verification_requests(self) -> List[VerificationRequest]:
        return list(self.verification_requests.values())
    
    def get_verification_requests_by_status(self, status: VerificationStatus) -> List[VerificationRequest]:
        return [req for req in self.verification_requests.values() if req.overall_status == status]


db = Database()
