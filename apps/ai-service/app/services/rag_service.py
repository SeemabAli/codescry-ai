import hashlib
import logging
from typing import Any, Optional

from google import genai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.core.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 768

# Built-in industry best practices seeded into Qdrant vector store
STANDARD_BEST_PRACTICES = [
    {
        "id": 1,
        "category": "Security",
        "title": "SQL and NoSQL Injection Prevention",
        "guideline": "Never concatenate user input directly into database queries or Mongo operators ($where, $regex). Always use parameterized queries, typed ORM/ODM models, and sanitize/validate payloads with schema libraries like Zod or Pydantic.",
    },
    {
        "id": 2,
        "category": "Security",
        "title": "Authentication & Password Hashing",
        "guideline": "Never store or compare passwords in plaintext. Use bcrypt or Argon2id with adequate work factors. Never return password hashes, internal secret tokens, or PII in API responses.",
    },
    {
        "id": 3,
        "category": "Bug",
        "title": "Async Error Handling and Rejections",
        "guideline": "Asynchronous operations in Express route handlers and controller middleware must always be enclosed in try/catch or wrapped with express-async-errors. Uncaught promise rejections crash the Node.js event loop.",
    },
    {
        "id": 4,
        "category": "Performance",
        "title": "Database Query Optimization and Indexing",
        "guideline": "Avoid unbounded queries without pagination (limit/skip). Always project needed fields with .select(...) instead of loading whole documents. Ensure queries filtering on specific fields have matching database indexes.",
    },
    {
        "id": 5,
        "category": "Performance",
        "title": "React Re-rendering and Hook Dependencies",
        "guideline": "Use the exhaustive-deps rule for useEffect and useMemo. Do not mutate state objects directly; always create fresh immutable copies or functional state updates. Memoize heavy compute functions.",
    },
    {
        "id": 6,
        "category": "Maintainability",
        "title": "Strict Type Safety and Boundary Validation",
        "guideline": "Avoid using 'any' in TypeScript. Validate all untrusted external input (headers, params, query, body) at the application boundaries before passing data to domain services.",
    },
    {
        "id": 7,
        "category": "Security",
        "title": "CORS, Helmet, and Rate Limiting",
        "guideline": "Always enable HTTP security headers with Helmet, restrict CORS origins explicitly rather than using wildcard (*), and enforce rate limiting on sensitive routes (auth, password reset, payment).",
    },
]


class RAGService:
    def __init__(self) -> None:
        self.client: Optional[QdrantClient] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=100,
            separators=["\nclass ", "\ndef ", "\nfunction ", "\nconst ", "\n\n", "\n", " ", ""],
        )
        self._init_qdrant()

    def _init_qdrant(self) -> None:
        """Initializes Qdrant client and seeds best practices collection."""
        try:
            if settings.QDRANT_URL == ":memory:":
                self.client = QdrantClient(":memory:")
            elif settings.QDRANT_URL.startswith("http"):
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY or None,
                )
            else:
                self.client = QdrantClient(path=settings.QDRANT_URL)

            collection_name = settings.QDRANT_COLLECTION
            if not self.client.collection_exists(collection_name):
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
                )
                self._seed_best_practices()
                logger.info(f"Qdrant collection '{collection_name}' initialized and seeded.")
        except Exception as err:
            logger.error(f"Failed to initialize Qdrant client: {err}", exc_info=True)
            self.client = None

    def _seed_best_practices(self) -> None:
        """Seeds initial best practices vectors into Qdrant."""
        if not self.client:
            return

        points: list[PointStruct] = []
        for bp in STANDARD_BEST_PRACTICES:
            text = f"{bp['title']} ({bp['category']}): {bp['guideline']}"
            vector = self.embed_text(text)
            points.append(
                PointStruct(
                    id=bp["id"],
                    vector=vector,
                    payload=bp,
                )
            )

        self.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points,
        )

    def split_code(self, code_diff: str) -> list[str]:
        """Splits code diff or file content into semantically coherent chunks."""
        if not code_diff or not code_diff.strip():
            return []
        chunks = self.text_splitter.split_text(code_diff)
        return chunks if chunks else [code_diff]

    def _deterministic_hash_vector(self, text: str) -> list[float]:
        """Generates a stable 768-dim normalized embedding when offline/without key."""
        vec = []
        for i in range(EMBEDDING_DIM):
            token = f"{text}:{i}"
            h = int(hashlib.sha256(token.encode("utf-8")).hexdigest()[:8], 16)
            vec.append((h / 0xFFFFFFFF) * 2.0 - 1.0)
        norm = sum(x * x for x in vec) ** 0.5 or 1.0
        return [round(x / norm, 6) for x in vec]

    def embed_text(self, text: str) -> list[float]:
        """Embeds text using Gemini text-embedding-004 model via google-genai."""
        if not settings.GEMINI_API_KEY:
            return self._deterministic_hash_vector(text)

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            model_name = settings.GEMINI_EMBEDDING_MODEL or "text-embedding-004"
            response = client.models.embed_content(
                model=model_name,
                contents=text,
            )
            if response.embeddings and len(response.embeddings) > 0:
                values = response.embeddings[0].values
                return list(values)
        except Exception as ex:
            logger.warning(f"Gemini embedding failed ({ex}). Falling back to deterministic vector.")

        return self._deterministic_hash_vector(text)

    def retrieve_relevant_practices(self, query_or_code: str, top_k: int = 3) -> list[dict[str, Any]]:
        """
        Queries Qdrant for best practices matching the provided code diff or query.
        Returns the top-k guidelines.
        """
        if not self.client:
            # Fallback if Qdrant isn't initialized
            return STANDARD_BEST_PRACTICES[:top_k]

        try:
            query_vector = self.embed_text(query_or_code[:2000])
            search_result = self.client.query_points(
                collection_name=settings.QDRANT_COLLECTION,
                query=query_vector,
                limit=top_k,
            )

            retrieved: list[dict[str, Any]] = []
            for point in search_result.points:
                payload = dict(point.payload or {})
                payload["score"] = getattr(point, "score", 1.0)
                retrieved.append(payload)

            return retrieved if retrieved else STANDARD_BEST_PRACTICES[:top_k]
        except Exception as err:
            logger.error(f"Error querying Qdrant best practices: {err}")
            return STANDARD_BEST_PRACTICES[:top_k]


rag_service = RAGService()
