# SprintSync

SprintSync is a focused task management app with AI-powered daily planning. It’s a production-grade monorepo (NestJS API + Next.js Web) with clean architecture, observability, tests, and deploy-ready configs.

## Features

- Auth: JWT Bearer (no cookies), role-aware (admin routes)
- Tasks: CRUD, status updates (owner can set any status), timer (start/stop), total time tracking
- Kanban: Drag-and-drop board (TODO / IN_PROGRESS / DONE)
- Analytics: Time logged per day (minutes/day line chart)
- AI: Daily plan suggestion via OpenAI (with deterministic stub fallback)
- Observability: Structured logs, request ID, latency, global error filter
- DX: Swagger v8 docs, class-validator/transformer, typed services, tests

## Tech Stack

- Backend: NestJS, TypeORM, PostgreSQL, JWT, Swagger v8, nestjs-pino
- Frontend: Next.js (App Router), Mantine, React Query, Redux Toolkit, Axios, Mantine Charts, @dnd-kit
- Infra: pnpm workspaces + Turborepo, Docker (optional), CI (GitHub Actions)

## Repo Layout

- `apps/api` — NestJS API
- `apps/web` — Next.js Web
- `packages/shared` — shared code (if needed)
- `infra/docker` — Dockerfiles and compose (local/prod)

## Local Development

1. Install deps: `pnpm install`
2. Start dev:
   - API: `pnpm -F @sprintsync/api dev` (http://localhost:4000, Swagger at /docs)
   - Web: `pnpm -F @sprintsync/web dev` (http://localhost:3000)
3. Env (local):
   - API needs Postgres (see Docker compose in `infra/docker`).
   - Set `JWT_SECRET`, `JWT_REFRESH_SECRET`; optional `OPENAI_API_KEY`.

## API Reference

- Swagger at `/docs` on the API
- Core endpoints:
  - `POST /auth/login` → `{ accessToken, refreshToken, user }`
  - `GET /auth/me` → `{ userId, isAdmin, name }`
  - `GET /tasks` (user-scoped; admin can pass `?all=true`)
  - `POST /tasks/:id/start-timer`, `POST /tasks/:id/stop-timer`
  - `PATCH /tasks/:id/status` (owner can set any status)
  - `GET /tasks/analytics/time-per-day?days=14` → `{ day, milliseconds }[]`

## Testing

- API: Jest unit + e2e (in-memory DB for tests)
- Web: Vitest unit tests
  Run all: `pnpm test` (monorepo). See CI workflow for reference.

## Deploy

### API (Render)

- `render.yaml` at repo root provisions API + managed Postgres.
- Render: New → Blueprint → select repo → Deploy.
- Set env on `sprintsync-api`:
  - `WEB_ORIGIN`: your Vercel domain (e.g., https://<project>.vercel.app)
  - `OPENAI_API_KEY` (optional)
- Verify `https://<render-service>/docs` is reachable.

### Web (Vercel)

- Import repo, Root Directory: `apps/web`.
- Env: `NEXT_PUBLIC_API_URL` → your Render API URL.
- Build using Next.js defaults (Node 20).

## CI

- GitHub Actions runs lint and both test suites on push/PR. The workflow sets up pnpm and splits API (Jest) and Web (Vitest) runs.

## Notes

- CORS is controlled by `WEB_ORIGIN` on the API.
- Tokens are stored as Bearer in localStorage; no cookies required.
- Status changes: any owner can set status; admin-only delete is still enforced.
