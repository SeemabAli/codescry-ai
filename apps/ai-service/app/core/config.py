import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    AI_SERVICE_NAME: str = os.getenv("AI_SERVICE_NAME", "CodeScry AI Service")
    AI_SERVICE_PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    NODE_API_URL: str = os.getenv("NODE_API_URL", "http://localhost:5000")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    AI_ANALYZER_MODE: str = os.getenv("AI_ANALYZER_MODE", "llm")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


settings = Settings()