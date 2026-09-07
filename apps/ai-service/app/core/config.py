import os
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    AI_SERVICE_NAME: str = "CodeScry AI Service"
    AI_SERVICE_PORT: int = 8000
    NODE_API_URL: str = "http://localhost:5000"
    ENVIRONMENT: str = "development"

    AI_ANALYZER_MODE: str = "llm"
    AI_PROVIDER: str = "gemini"

    # Google Gemini Configuration (Runs exclusively on Gemini)
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API key from https://aistudio.google.com/app/apikey",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-2.5-pro",
        description="Default reasoning model for code reviews and agent decisions",
    )
    GEMINI_FLASH_MODEL: str = Field(
        default="gemini-2.5-flash",
        description="Configurable fallback/cheaper model for light tasks",
    )
    GEMINI_EMBEDDING_MODEL: str = Field(
        default="text-embedding-004",
        description="Gemini embedding model for RAG best practice retrieval",
    )

    # Qdrant Vector Database Configuration
    QDRANT_URL: str = Field(
        default=":memory:",
        description="Qdrant connection URL (':memory:', local directory path, or remote URL)",
    )
    QDRANT_API_KEY: str = Field(
        default="",
        description="Optional API key for remote Qdrant instances",
    )
    QDRANT_COLLECTION: str = Field(
        default="codescry_best_practices",
        description="Qdrant collection name for best practice vectors",
    )

    # GitHub API Configuration
    GITHUB_TOKEN: str = Field(
        default="",
        description="GitHub token for PR diff retrieval and autonomous comments",
    )

    # LangGraph Checkpoint Storage
    CHECKPOINT_DB_PATH: str = Field(
        default="review_checkpoints.db",
        description="SQLite database file for LangGraph persistent checkpoints",
    )

    # Legacy OpenAI settings (Deprecated in favor of Gemini)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    @model_validator(mode="after")
    def resolve_gemini_key(self) -> "Settings":
        if not self.GEMINI_API_KEY:
            fallback = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
            if fallback:
                self.GEMINI_API_KEY = fallback
        return self


settings = Settings()