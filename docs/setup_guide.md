# STUDYAI — Comprehensive Development Setup Guide

This document provides complete instructions for configuring, running, and contributing to the **STUDYAI** production ecosystem.

---

## 1. Prerequisites & Toolchains

| Component | Minimum Version | Recommended Installation |
|---|---|---|
| **Python** | 3.11+ | `pyenv install 3.11.8` |
| **Node.js** | 20+ LTS | `nvm install 24.22.0` |
| **Flutter SDK** | 3.27+ | Download from [flutter.dev](https://flutter.dev) or `brew install --cask flutter` |
| **PostgreSQL** | 15+ | Docker or Supabase CLI |
| **Docker Engine** | 24+ | Docker Desktop / OrbStack |

---

## 2. Environment Configuration

Copy the example environment templates:

```bash
# For backend development
cp infrastructure/deployment/.env.development.example backend/.env

# For containerized orchestration
cp infrastructure/deployment/.env.development.example .env
```

Review and adjust API keys:
- `OLLAMA_BASE_URL`: Defaults to `http://localhost:11434` for local Qwen 2.5 7B.
- `OPENAI_API_KEY`: Key for GPT fallback and evaluations.
- `GEMINI_API_KEY`: Key for Google Gemini 1.5/2.0 multimodal reasoning.
- `GROK_API_KEY`: Key for xAI Grok.
- `FEATURE_VIDEO_GENERATION`: Must remain set to `false`.

---

## 3. Database Setup (Supabase / PostgreSQL)

### Option A: Local Docker PostgreSQL
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up postgres -d
```

### Option B: Supabase CLI
```bash
supabase init
supabase start
supabase db reset
```

Apply migrations and policies in order:
```bash
psql -h localhost -U studyai_user -d studyai_production -f database/migrations/001_initial_schema.sql
psql -h localhost -U studyai_user -d studyai_production -f database/policies/002_rls_policies.sql
psql -h localhost -U studyai_user -d studyai_production -f database/seeds/003_seed_data.sql
```

---

## 4. FastAPI Backend Execution

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Run development server
uvicorn backend.app.main:app --reload --port 8000
```

Verify backend health:
```bash
curl http://localhost:8000/api/v1/health
```

Run test suite:
```bash
pytest backend/tests -v
```

---

## 5. Web Development Stack Execution (Vite + Node Server)

To run the interactive React & TypeScript application with Node backend:

```bash
# Install dependencies
npm install

# Start synchronized dev servers (Vite on :5173, Node Backend on :3001)
npm run dev
```

### Active Application & Portal URLs

| Application / Portal | Local Development URL | Default Test Account | Role |
| :--- | :--- | :--- | :--- |
| **Main App (Dashboard)** | `http://localhost:5173/` | `vishwak@studyai.edu` | Student |
| **AI Speaking & Languages** | `http://localhost:5173/languages` | `vishwak@studyai.edu` | Student |
| **Library Hub** | `http://localhost:5173/library` | `vishwak@studyai.edu` | Student |
| **School Admin Portal** | `http://localhost:5173/admin` | `admin@studyai.edu` | Admin |
| **Super Admin Console** | `http://localhost:5173/superadmin` | `superadmin@studyai.edu` | Super Admin |
| **Parent Portal** | `http://localhost:5173/profile` (Passcode: `2468`) | `parent@studyai.edu` | Parent |
| **Backend REST API** | `http://localhost:3001/api` | System API Tokens | Internal |

---

## 6. Multi-App Flutter Execution (Cross-Platform)

### Student App
```bash
cd apps/student_app
flutter pub get
flutter run -d chrome --web-port 3000
```

### Admin Portal
```bash
cd apps/admin_portal
flutter pub get
flutter run -d chrome --web-port 3002
```

### Super Admin Portal
```bash
cd apps/superadmin_portal
flutter pub get
flutter run -d chrome --web-port 3003
```

---

## 6. Full-Stack Docker Compose Orchestration

To run the entire ecosystem (Postgres, FastAPI backend, Student Web, Admin Web) in synchronized containers:

```bash
docker-compose -f infrastructure/docker/docker-compose.yml up --build
```
