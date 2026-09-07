from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import agent_router, health_router, review_router
from app.core.config import settings

app = FastAPI(
    title=settings.AI_SERVICE_NAME,
    version="2.0.0",
    description="FastAPI Agentic AI service for CodeScry AI autonomous PR code review workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(review_router)
app.include_router(agent_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to CodeScry AI Autonomous PR Review Service",
        "version": "2.0.0",
        "endpoints": {
            "structured_review": "/api/review-code",
            "agent_start": "/api/agent/review-pr",
            "agent_state": "/api/agent/review-pr/{thread_id}/state",
            "agent_resume": "/api/agent/review-pr/{thread_id}/resume",
            "docs": "/docs",
        },
    }