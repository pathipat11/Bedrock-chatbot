import json, uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import models
from app.core.security import decode_token
from app.services.bedrock_stream import claude_stream

router = APIRouter(prefix="/api", tags=["chat"])

class ChatReq(BaseModel):
    conversation_id: str | None = None
    message: str

def get_user_id_from_auth(authorization: str | None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    return payload["sub"]

@router.post("/chat/stream")
def chat_stream(
    req: ChatReq,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    user_id = get_user_id_from_auth(authorization)

    # conversation
    if req.conversation_id:
        conv = db.query(models.Conversation).filter(
            models.Conversation.id == req.conversation_id,
            models.Conversation.user_id == user_id
        ).first()
        if not conv:
            raise HTTPException(404, "Conversation not found")
    else:
        conv = models.Conversation(user_id=user_id, title=None)
        db.add(conv); db.commit(); db.refresh(conv)

    # load history ล่าสุด (จำกัดจำนวนข้อความกัน prompt ยาว)
    rows = db.query(models.Message).filter(models.Message.conversation_id == conv.id)\
        .order_by(models.Message.created_at.asc()).all()

    history = [{"role": r.role, "content": r.content} for r in rows if r.role in ("user","assistant")]
    history.append({"role": "user", "content": req.message})

    # save user message
    db.add(models.Message(conversation_id=conv.id, role="user", content=req.message))
    db.commit()

    def sse_gen():
        # ส่ง conversation_id ให้ frontend ก่อน (จะได้เก็บไว้)
        yield f"event: meta\ndata: {json.dumps({'conversation_id': str(conv.id)})}\n\n"

        full = []
        for token in claude_stream(
            messages=history,
            system_prompt="You are a helpful chatbot. Answer in Thai unless user uses English."
        ):
            full.append(token)
            # SSE data
            yield f"data: {json.dumps({'delta': token})}\n\n"

        answer = "".join(full)

        # save assistant message
        db.add(models.Message(conversation_id=conv.id, role="assistant", content=answer))
        db.commit()

        yield f"event: done\ndata: {json.dumps({'ok': True})}\n\n"

    return StreamingResponse(sse_gen(), media_type="text/event-stream")
