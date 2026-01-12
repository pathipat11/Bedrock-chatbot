import os, json
import boto3

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID")  # inference profile ARN (ที่คุณใช้ได้แล้ว)

client = boto3.client("bedrock-runtime", region_name=AWS_REGION)

def clamp_title(t: str) -> str:
    t = (t or "").strip().replace("\n", " ")
    t = " ".join(t.split())
    # กัน title ว่าง / ยาวเกิน
    if not t:
        return "Untitled"
    return t[:80]

def generate_title(user_msg: str, assistant_msg: str) -> str:
    """
    คืน title สั้น ๆ 3-7 คำ (ภาษาเดียวกับ user เป็นหลัก)
    """
    system = (
        "You are a title generator for chat conversations.\n"
        "Return ONLY the title text (no quotes, no markdown, no punctuation at the end).\n"
        "Title must be short (3-7 words). Use the user's language.\n"
    )

    prompt = (
        "Create a short conversation title.\n\n"
        f"User message:\n{user_msg}\n\n"
        f"Assistant response:\n{assistant_msg}\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 40,
        "temperature": 0.2,
        "system": system,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    }

    resp = client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body).encode("utf-8"),
        accept="application/json",
        contentType="application/json",
    )

    data = json.loads(resp["body"].read().decode("utf-8"))

    # Bedrock Anthropic มักได้รูปแบบ content list
    # { "content": [{"type":"text","text":"..."}], ... }
    text = ""
    content = data.get("content") or []
    if isinstance(content, list) and content:
        text = (content[0].get("text") or "").strip()

    return clamp_title(text)