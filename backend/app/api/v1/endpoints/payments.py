from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_ACCOUNTANT,
    AuthenticatedUser, get_current_user, require_role
)
from ....repositories.db_state import db_state

router = APIRouter()


class PaymentItem(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    amount: float
    currency: str
    status: str
    gateway: str
    transaction_ref: str
    invoice_url: Optional[str] = None
    description: str


@router.get("/my", response_model=List[PaymentItem], summary="Get User Invoices & Payments")
async def get_my_payments(user: AuthenticatedUser = Depends(get_current_user)):
    return [PaymentItem(**p) for p in db_state.payments if p["user_id"] == user.id]


@router.get("/all", response_model=List[PaymentItem], summary="Get All Tenant Payments (Accountant / Admin)")
async def get_all_payments(user: AuthenticatedUser = Depends(require_role([ROLE_ACCOUNTANT, ROLE_ADMIN, ROLE_SUPERADMIN]))):
    return [PaymentItem(**p) for p in db_state.payments]
