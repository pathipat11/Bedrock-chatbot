import uuid, secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import models
from app.core.security import decode_token, hash_password, verify_password, create_access_token
from app.core.mailer import send_mail
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

class RegisterReq(BaseModel):
    email: EmailStr
    username: str
    password: str

class LoginReq(BaseModel):
    email: EmailStr
    password: str

class ForgotReq(BaseModel):
    email: EmailStr

class ResetReq(BaseModel):
    token: str
    new_password: str

@router.post("/register")
def register(req: RegisterReq, db: Session = Depends(get_db)):
    if db.query(models.User).filter(
        (models.User.email == req.email) | (models.User.username == req.username)
    ).first():
        raise HTTPException(400, "Email or username already exists")

    if len(req.password) < 8:
        raise HTTPException(422, "Password too short")

    u = models.User(
        email = req.email.lower(),
        username = req.username.lower(),
        password_hash=hash_password(req.password)
    )
    db.add(u)
    db.commit()
    db.refresh(u)

    return {
        "id": str(u.id),
        "email": u.email,
        "username": u.username
    }

@router.post("/login")
def login(req: LoginReq, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == req.email.lower()).first()

    if not u or not verify_password(req.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(sub=str(u.id))
    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotReq, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == req.email.lower()).first()
    if not u:
        return {"ok": True}

    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=30)

    prt = models.PasswordResetToken(user_id=u.id, token=token, expires_at=expires, used=False)
    db.add(prt); db.commit()

    reset_link = f"{FRONTEND_BASE_URL}/reset-password?token={token}"
    send_mail(
        to=u.email,
        subject="Reset your password",
        html=f"<p>Click to reset password:</p><p><a href='{reset_link}'>{reset_link}</a></p><p>Expires in 30 minutes.</p>",
    )
    return {"ok": True}

@router.post("/reset-password")
def reset_password(req: ResetReq, db: Session = Depends(get_db)):
    row = db.query(models.PasswordResetToken).filter(models.PasswordResetToken.token == req.token).first()
    if not row or row.used or row.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired token")

    u = db.query(models.User).filter(models.User.id == row.user_id).first()
    if not u:
        raise HTTPException(400, "Invalid token")

    u.password_hash = hash_password(req.new_password)
    row.used = True
    db.commit()
    return {"ok": True}

@router.get("/me")
def me(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Unauthorized")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    user_id = payload["sub"]

    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(401, "Unauthorized")

    return {
        "id": str(u.id),
        "email": u.email,
        "username": u.username
    }