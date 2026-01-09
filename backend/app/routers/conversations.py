from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.core.security import decode_token

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

def get_user_id(authorization: str | None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    return payload["sub"]

class TitleReq(BaseModel):
    title: str

@router.get("")
def list_conversations(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    user_id = get_user_id(authorization)
    rows = (
        db.query(models.Conversation)
        .filter(models.Conversation.user_id == user_id)
        .order_by(models.Conversation.created_at.desc())
        .all()
    )
    return [{"id": str(c.id), "title": c.title, "created_at": c.created_at.isoformat()} for c in rows]

@router.post("")
def create_conversation(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    user_id = get_user_id(authorization)
    conv = models.Conversation(user_id=user_id, title=None)
    db.add(conv); db.commit(); db.refresh(conv)
    return {"id": str(conv.id)}

@router.get("/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    user_id = get_user_id(authorization)
    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == user_id
    ).first()
    if not conv:
        raise HTTPException(404, "Conversation not found")

    rows = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conv.id)
        .order_by(models.Message.created_at.asc())
        .limit(20)
        .all()
    )
    rows = list(reversed(rows))
    return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in rows]

@router.patch("/{conversation_id}")
def update_conversation_title(
    conversation_id: str,
    req: TitleReq,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    user_id = get_user_id(authorization)

    conv = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == user_id,
    ).first()
    if not conv:
        raise HTTPException(404, "Conversation not found")

    title = (req.title or "").strip()
    if not title:
        raise HTTPException(422, "Title is required")

    # กัน title ยาวเกิน / กันสแปม
    conv.title = title[:80]
    db.commit()

    return {"id": str(conv.id), "title": conv.title}