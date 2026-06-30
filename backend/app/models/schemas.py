from typing import Any

from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    team_size: int = 4
    hackathon_type: str = "AI"
    preferred_stack: str = "MERN"


class GenerateRequest(BaseModel):
    problem_statement: str = Field(..., min_length=10, max_length=2000)
    preferences: UserPreferences = Field(default_factory=UserPreferences)


class AgentOutput(BaseModel):
    agent: str
    title: str
    content: str
    duration_sec: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class JudgeScores(BaseModel):
    innovation: float
    impact: float
    technical: float
    scalability: float
    feedback: str


class GenerateResponse(BaseModel):
    session_id: str
    problem_statement: str
    agents: list[AgentOutput]
    judge: JudgeScores | None = None
    total_duration_sec: float | None = None
    rag_search_duration_sec: float | None = None


class ReportRequest(BaseModel):
    session_id: str | None = None
    problem_statement: str
    agents: list[AgentOutput]
    judge: JudgeScores | None = None
