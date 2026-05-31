import asyncio
import logging
from io import BytesIO

from openai import AsyncOpenAI

from .config import settings

logger = logging.getLogger(__name__)

DEFAULT_VOICE = "zh-CN-YunjianNeural"


async def transcribe_audio(
    audio_bytes: bytes,
    content_type: str,
    api_key: str = "",
    base_url: str = "",
    model: str = "",
) -> str:
    effective_key = api_key or settings.llm_api_key
    if not effective_key:
        raise RuntimeError("未提供 API Key，无法使用语音转文字服务")

    effective_base_url = base_url or settings.llm_base_url or None
    client = AsyncOpenAI(
        api_key=effective_key,
        base_url=effective_base_url,
        timeout=30.0,
    )

    ext = "wav" if "wav" in content_type else "webm"
    filename = f"audio.{ext}"

    response = await client.audio.transcriptions.create(
        model=model or "whisper-1",
        file=(filename, audio_bytes, content_type),
    )

    text = response.text or ""
    logger.info(f"STT transcribed {len(audio_bytes)} bytes -> {len(text)} chars")
    return text


async def synthesize_speech(text: str, voice: str | None = None) -> bytes:
    voice = voice or DEFAULT_VOICE

    try:
        import edge_tts
    except ImportError:
        raise RuntimeError("edge-tts 未安装，请运行: pip install edge-tts")

    communicate = edge_tts.Communicate(text, voice)
    buffer = BytesIO()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])

    audio_bytes = buffer.getvalue()
    buffer.close()

    if not audio_bytes:
        raise RuntimeError("TTS 合成失败：未收到音频数据")

    logger.info(f"TTS synthesized {len(audio_bytes)} bytes with voice '{voice}'")
    return audio_bytes
