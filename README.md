# TimeCapsule

Immersive, AI-generated time-travel experiences — witness history where it happened, in a specific city, at a specific year, in 360°/VR.

## Repository Structure

```
timecapsule/
├── backend/    Laravel 11 API (PHP 8.3, PostgreSQL, Redis, Sanctum)
├── frontend/   React 18 + TypeScript SPA (Vite, Tailwind CSS v4, Redux Toolkit)
├── infra/      Docker Compose, Dockerfiles, nginx reverse proxy config
├── .github/    CI workflows (backend-ci.yml, frontend-ci.yml)
└── docs/       Project specification and API reference
```

## Local Development

### Prerequisites
- PHP 8.3+ and Composer (backend)
- Node.js 22+ and npm (frontend)
- Docker + Docker Compose (recommended, runs everything together)
- PostgreSQL 16 and Redis 7 (if not using Docker)

### Quick start with Docker Compose
```bash
cd infra
docker compose up --build
```
This starts Postgres, Redis, the Laravel API (`:8000`), the Vite dev server (`:5173`), and nginx (`:80`) as a reverse proxy in front of both.

### Backend (manual setup)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
php artisan test    # Pest/PHPUnit — run before every commit
```

### Frontend (manual setup)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
npm run test    # Vitest — run before every commit
npm run build
```

## Note on this scaffold
This repository was generated in a sandboxed planning environment without a PHP runtime or Packagist access. The **frontend was fully installed, built, and test-verified** (Vitest smoke test passes, production build succeeds). The **backend skeleton is hand-written to match exactly what `laravel new` produces** (composer.json, config, routing, a real Pest smoke test), but has not been executed here — run `composer install` locally or via the Docker Compose setup above to pull vendor dependencies and verify `php artisan test` passes green before Milestone 2 begins.

## Workflow
This project follows a strict phased, sign-off-gated build process. See `docs/PROJECT_SPEC.md` for the full PRD, architecture, and milestone checklist. Do not skip ahead to a milestone without an explicit sign-off from the project owner.
