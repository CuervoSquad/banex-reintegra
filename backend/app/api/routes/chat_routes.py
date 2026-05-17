from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "Eres un asistente financiero experto en Banexcoin y el sistema BANEXCOIN. "
    "Ayudas con preguntas sobre cashback, reintegros, niveles de fidelidad, "
    "transacciones QR y la estrategia de expansión LATAM de Banexcoin. "
    "Responde siempre en español, de forma clara y concisa."
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest):
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="API de IA no configurada")

    client = OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://banexcoin.com",
            "X-Title": "BANEX Asistente",
        },
    )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b:free",
            messages=messages,
            max_tokens=1024,
        )
        reply = completion.choices[0].message.content or ""
        return ChatResponse(reply=reply)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Error al contactar IA: {exc}") from exc
