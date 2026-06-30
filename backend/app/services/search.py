from app.config import settings


async def search_web(query: str, max_results: int = 5) -> str:
    if settings.tavily_api_key:
        return await _search_tavily(query, max_results)
    if settings.serper_api_key:
        return await _search_serper(query, max_results)
    return ""


async def _search_tavily(query: str, max_results: int) -> str:
    import httpx

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": settings.tavily_api_key,
                "query": query,
                "max_results": max_results,
            },
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        if not results:
            return ""
        lines = [f"- {r.get('title', '')}: {r.get('content', '')[:300]}" for r in results]
        return "\n".join(lines)


async def _search_serper(query: str, max_results: int) -> str:
    import httpx

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": settings.serper_api_key},
            json={"q": query, "num": max_results},
        )
        response.raise_for_status()
        data = response.json()
        organic = data.get("organic", [])
        if not organic:
            return ""
        lines = [f"- {r.get('title', '')}: {r.get('snippet', '')}" for r in organic]
        return "\n".join(lines)
