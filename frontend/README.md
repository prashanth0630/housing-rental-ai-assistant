# Frontend

React/Vite frontend for the Housing Rental AI Assistant. It provides login, document management, chat sessions, streaming responses, source-reference display, and bilingual UI text.

## Stack

| Area | Tools |
| --- | --- |
| App | React 19, TypeScript 5.8, Vite 7 |
| Styling | Tailwind CSS, Typography plugin |
| Routing | React Router |
| API | Axios, REST, Server-Sent Events |
| Text | React Markdown, i18next |

## Pages

- `/login`: user login
- `/register`: user registration
- `/chat`: chat session list and document-grounded Q&A
- `/docs`: admin document upload, preview, and deletion

## Local Run

```bash
cd frontend
npm ci
npm run dev
```

The Vite dev server proxies `/api` requests to the backend at `http://localhost:8080`.

## Build

```bash
npm run build
```

The production output is written to `frontend/dist/` and can be served through the root Docker/Nginx setup.

## Notes

- The frontend does not call OpenAI directly; all model and retrieval calls go through the backend.
- API tokens are stored client-side for the local demo flow.
- Full application testing requires the backend, MySQL, and configured OpenAI API access.
