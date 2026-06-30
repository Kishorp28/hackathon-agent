from app.config import settings


def get_qdrant_client():
    try:
        from qdrant_client import QdrantClient

        return QdrantClient(url=settings.qdrant_url)
    except Exception:
        return None


async def retrieve_context(query: str, limit: int = 3) -> str:
    client = get_qdrant_client()
    if not client:
        return ""

    try:
        collections = client.get_collections().collections
        names = [c.name for c in collections]
        if settings.qdrant_collection not in names:
            return ""

        embedded_vector = await _embed_query(query)
        results = client.search(
            collection_name=settings.qdrant_collection,
            query_vector=embedded_vector,
            limit=limit,
        )
        if not results:
            return ""

        chunks = []
        for hit in results:
            payload = hit.payload or {}
            text = payload.get("text") or payload.get("content") or str(payload)
            chunks.append(f"- {text[:500]}")
        return "\n".join(chunks)
    except Exception:
        return ""


async def _embed_query(query: str) -> list[float]:
    """Get real embeddings from Gemini text-embedding-004 REST API, or fallback to placeholder."""
    if not settings.gemini_api_key:
        return _fallback_embed(query)

    import httpx
    url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": query}]
        }
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
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
                return data.get("embedding", {}).get("values", [])
    except Exception:
        pass

    return _fallback_embed(query)


def _fallback_embed(query: str) -> list[float]:
    import hashlib

    seed = int(hashlib.md5(query.encode()).hexdigest()[:8], 16)
    return [(seed >> i & 1) * 0.1 + 0.05 for i in range(384)]
