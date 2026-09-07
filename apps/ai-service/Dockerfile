# ==============================================================================
# Multi-Stage Dockerfile for CodeScry AI Service (FastAPI + LangGraph + Gemini)
# Optimized for minimal image size, security (non-root user), and layer caching
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

# Install required build tools for C extensions (e.g., grpcio, sqlite-vec)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into a separate prefix directory for clean copying
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ------------------------------------------------------------------------------
# Stage 2: Runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

# Set secure, deterministic Python environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    AI_SERVICE_PORT=8000 \
    ENVIRONMENT=production

# Install minimal runtime dependencies needed for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user and group for container security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser

WORKDIR /app

# Copy pre-built packages from the builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY --chown=appuser:appgroup app /app/app

# Create writable directory for SQLite checkpoints and Qdrant local storage
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Switch to unprivileged user
USER appuser

EXPOSE 8000

# Container healthcheck querying FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
