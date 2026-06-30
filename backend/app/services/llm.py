import asyncio
import json
import logging
import random
import re
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def call_flowise(question: str, override_config: dict[str, Any] | None = None) -> str | None:
    if not settings.flowise_chatflow_id:
        return None

    url = f"{settings.flowise_url}/api/v1/prediction/{settings.flowise_chatflow_id}"
    payload: dict[str, Any] = {"question": question}
    if override_config:
        payload["overrideConfig"] = override_config

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("text") or data.get("json") or str(data)
    except Exception:
        return None


async def call_openai(prompt: str, system: str = "You are a helpful AI assistant.") -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    return response.choices[0].message.content or ""


async def call_gemini(prompt: str, system: str = "You are a helpful AI assistant.") -> str:
    """Call Gemini via REST API (supports both AIza and AQ. auth keys) with retries for transient errors."""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/{settings.gemini_model}:generateContent"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system}]},
        "generationConfig": {"temperature": 0.7},
    }

    max_retries = 6
    initial_delay = 1.0
    multiplier = 2.0
    max_delay = 35.0

    async with httpx.AsyncClient(timeout=180.0) as client:
        for attempt in range(1, max_retries + 1):
            custom_delay = None
            try:
                response = await client.post(
                    url,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": settings.gemini_api_key,
                    },
                    json=payload,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise ValueError("Gemini returned no candidates")
                    parts = candidates[0].get("content", {}).get("parts", [])
                    return "".join(part.get("text", "") for part in parts)
                
                # Check for transient error status codes: 429 or 5xx
                is_transient = response.status_code == 429 or (500 <= response.status_code < 600)
                error_body = response.text
                
                if response.status_code == 429:
                    # 1. Check Retry-After header
                    retry_after = response.headers.get("retry-after")
                    if retry_after:
                        try:
                            custom_delay = float(retry_after) + 1.0
                        except ValueError:
                            pass
                    
                    # 2. Check for "Please retry in X.Y s" in body
                    if not custom_delay:
                        match = re.search(r"Please retry in ([0-9.]+)s", error_body)
                        if match:
                            try:
                                custom_delay = float(match.group(1)) + 1.0
                            except ValueError:
                                pass
                
                if not is_transient or attempt == max_retries:
                    raise ValueError(
                        f"Gemini API error ({response.status_code}): {error_body[:500]}"
                    )
                
                wait_info = f"{custom_delay:.2f}s (dynamic wait)" if custom_delay else "exponential backoff"
                logger.warning(
                    f"Gemini API returned transient status {response.status_code}. "
                    f"Attempt {attempt}/{max_retries} failed. Retrying in {wait_info}..."
                )
                
            except httpx.RequestError as exc:
                if attempt == max_retries:
                    raise ValueError(f"Gemini API request failed: {exc}") from exc
                
                logger.warning(
                    f"Gemini API request network/timeout error: {exc}. "
                    f"Attempt {attempt}/{max_retries} failed. Retrying..."
                )
                
            # Sleep before next attempt
            if custom_delay is not None:
                await asyncio.sleep(custom_delay)
            else:
                delay = min(initial_delay * (multiplier ** (attempt - 1)), max_delay)
                jitter = random.uniform(0, 0.1 * delay)
                await asyncio.sleep(delay + jitter)

    raise ValueError("Gemini API call failed after max retries")


async def generate_text(prompt: str, system: str = "You are a helpful AI assistant.") -> str:
    flowise_result = await call_flowise(prompt)
    if flowise_result:
        return flowise_result

    if settings.llm_provider == "openai" and settings.openai_api_key:
        return await call_openai(prompt, system)
    if settings.gemini_api_key:
        return await call_gemini(prompt, system)
    if settings.openai_api_key:
        return await call_openai(prompt, system)

    raise ValueError(
        "No LLM configured. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env"
    )


def parse_judge_response(text: str) -> dict[str, Any]:
    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return {
        "innovation": 7.0,
        "impact": 7.0,
        "technical": 7.0,
        "scalability": 7.0,
        "feedback": text,
    }
