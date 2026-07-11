from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.review import router as review_router
from app.core.config import settings

app = FastAPI(
    title=settings.AI_SERVICE_NAME,
    version="1.0.0",
    description="FastAPI AI service for CodeScry AI code review workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(review_router)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to CodeScry AI Service",
        "docs": "/docs",
    }