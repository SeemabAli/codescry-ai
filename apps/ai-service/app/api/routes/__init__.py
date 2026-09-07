from app.api.routes.agent import router as agent_router
from app.api.routes.health import router as health_router
from app.api.routes.review import router as review_router

__all__ = ["health_router", "review_router", "agent_router"]
