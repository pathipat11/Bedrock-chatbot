import os, json
import boto3
from typing import Iterator

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("BEDROCK_MODEL_ID")

client = boto3.client("bedrock-runtime", region_name=AWS_REGION)

def claude_stream(messages, system_prompt: str) -> Iterator[str]:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 800,
        "temperature": 0.4,
        "system": system_prompt,
        "messages": messages,
    }

    resp = client.invoke_model_with_response_stream(
        modelId=MODEL_ID,
        body=json.dumps(body).encode("utf-8"),
        accept="application/json",
        contentType="application/json",
    )

    try: 
        for event in resp["body"]:
            chunk = event.get("chunk")
            if not chunk:
                continue
            data = json.loads(chunk.get("bytes").decode("utf-8"))

            if data.get("type") == "content_block_delta":
                delta = data.get("delta", {})
                text = delta.get("text")
                if text:
                    yield text
    
            if data.get("type") in ("message_stop", "content_block_stop"):
                continue
    except Exception as e:
        yield "\n[ERROR]"
        raise
