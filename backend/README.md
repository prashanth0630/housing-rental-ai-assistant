# Backend

Spring Boot backend for the Housing Rental AI Assistant. It handles authentication, document ingestion, RAG retrieval, chat persistence, and streaming responses.

## Responsibilities

- User registration and login with JWT authentication.
- Admin document upload, parsing, metadata storage, preview, and deletion.
- Text extraction for PDF, DOC, DOCX, TXT, Markdown, and HTML files.
- Document chunking and embedding with LangChain4j and OpenAI embeddings.
- Retrieval-augmented answers using retrieved chunks plus recent chat history.
- Persistent MySQL records for users, documents, chat sessions, and messages.
- SSE streaming endpoint for token-style chat responses.

## Stack

| Area | Tools |
| --- | --- |
| Runtime | Java 17, Spring Boot 3.3.3 |
| Security | Spring Security, JWT, BCrypt |
| Data | MySQL 8.4, MyBatis 3.0.4, Flyway |
| RAG | LangChain4j 0.33.0, OpenAI GPT-4o-mini, text-embedding-3-small |
| Parsing | Apache PDFBox, Apache POI |

## API Surface

| Area | Endpoint |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Documents | `POST /api/docs/upload`, `GET /api/docs`, `GET /api/docs/{id}`, `GET /api/docs/{id}/content`, `DELETE /api/docs/{id}` |
| Chat | `POST /api/chat/create`, `GET /api/chat/list`, `GET /api/chat/{chatId}/history`, `POST /api/chat/{chatId}/send`, `POST /api/chat/{chatId}/stream` |

## Local Run

Use the root `docker-compose.yml` for the full app. For backend-only development:

```bash
cd backend
mvn spring-boot:run
```

Required environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/rag_chat
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
OPENAI_API_KEY=
APP_SECURITY_JWT_SECRET=
```

## Notes

- The vector store is currently in memory and is rebuilt from uploaded files on startup.
- Runtime data and secrets should stay outside Git.
- The code is suitable for a course demo and local inspection; production use would require persistent vector storage and stricter document-level permissions.
