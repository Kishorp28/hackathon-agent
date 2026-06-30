from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_provider: str = "gemini"
    openai_api_key: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    flowise_url: str = "http://localhost:3000"
    flowise_chatflow_id: str = ""
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "hackathon_knowledge"
    database_url: str = "postgresql://hackathon:hackathon@localhost:5432/hackathon_partner"
    tavily_api_key: str = ""
    serper_api_key: str = ""
    frontend_url: str = "http://localhost:3001"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
