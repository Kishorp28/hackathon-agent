from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import hackathon

app = FastAPI(
    title="Hackathon Partner API",
    description="Multi-agent system for hackathon ideation, architecture, and pitch generation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hackathon.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hackathon Partner API", "docs": "/docs"}
