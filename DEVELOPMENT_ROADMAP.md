# STUDYAI — Eight-Phase Master Development Roadmap

This roadmap outlines the systematic, phased engineering trajectory to deliver the complete STUDYAI multimodal educational ecosystem.

---

## Phase Overview

$$\begin{aligned}
\text{Phase 1} &\longrightarrow \textbf{Foundation \& Architecture} \quad \text{(Current Phase)} \\
\text{Phase 2} &\longrightarrow \textbf{Central AI Orchestration \& Teaching Engine} \\
\text{Phase 3} &\longrightarrow \textbf{Visual Learning Engine \& Three.js 3D Lab} \\
\text{Phase 4} &\longrightarrow \textbf{AI Notes Studio (NotebookLM Ingestion \& Citations)} \\
\text{Phase 5} &\longrightarrow \textbf{Student Learning Journey, Games \& Examination Hub} \\
\text{Phase 6} &\longrightarrow \textbf{Parent Dashboard, Safeguards \& Security Enforcement} \\
\text{Phase 7} &\longrightarrow \textbf{Admin \& Super Admin Multitenant Management Portals} \\
\text{Phase 8} &\longrightarrow \textbf{Production Hardening, Multiplatform Deployment \& CI/CD}
\end{aligned}$$

---

## Detailed Phase Breakdown

### Phase 1 — Project Foundation & Architecture (Current Phase)
* [x] Deep repository inspection and technical debt audit (`PROJECT_AUDIT.md`, `EXISTING_FEATURES.md`).
* [x] Establish approved production technology stack (`TECHNOLOGY_STACK.md`).
* [x] Define multi-application monorepo structure supporting 5 discrete experiences (`ARCHITECTURE.md`).
* [x] Document development setup and known issues (`DEVELOPMENT_ROADMAP.md`, `KNOWN_ISSUES.md`).
* [x] Provision production monorepo folders: `apps/`, `backend/`, `database/`, `visual_learning/`, `packages/`, `infrastructure/`, `docs/`.
* [x] Configure FastAPI backend health-check endpoint (`/api/v1/health`).
* [x] Establish PostgreSQL / Supabase migration schema with initial tables and Row Level Security (RLS) policies.
* [x] Enforce server-side Video Generation restriction returning `403 Forbidden` (`FEATURE_DISABLED`).
* [x] Run automated test suites and verify production build.

### Phase 2 — Central AI Orchestration & Teaching Engine
* Implement the `ProviderRouter` in FastAPI with provider adapters:
  - `GoogleGeminiAdapter` (`gemini-3.8-flash`, `gemini-3.1-flash-image`)
  - `OpenAIAdapter` (`gpt-4o-mini`, DALL-E 3)
  - `GroqAdapter` (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`)
  - `OllamaAdapter` (`qwen2.5:7b`)
  - `CurriculumFallbackAdapter` (Offline mode)
* Standardize 11-step pedagogical prompt orchestration and response parsing across all models.
* Implement structured error recovery and automated multi-provider failover.

### Phase 3 — Visual Learning Engine & 3D Lab
* Centralize all 3D assets through official Three.js v0.170.0 engine (`visual_learning/three.js/`).
* Implement procedural anatomical and scientific models: Human Heart, DNA Double Helix, Photosynthesis/Chloroplast, Bohr Atom, Solar System, Water Cycle.
* Connect Flutter Dart bridge (`flutter_studyai_visual`) with Web IFrame and Mobile WebView surfaces.
* Enable 1-click raycaster component selection and targeted AI inquiry.

### Phase 4 — AI Notes Studio (NotebookLM Pipeline)
* Ingest multi-page academic textbooks with page-by-page chunking and precise bracketed page citations (`[Page 1]`).
* Ingest YouTube video lectures with transcript extraction and timestamped citations (`[12:45]`).
* Multi-source synthesis with automated contradiction detection across sources.
* Export to printable white-page HTML, formatted Word (`.doc`), and Markdown (`.md`).

### Phase 5 — Student Learning Journey, Games & Examinations
* Integrate 3 adaptive curriculum games: Space Answer Shooter 3D, Periodic Orbit, and Molecular Builder.
* Weekly examination generation with randomized answer keys, time limits, and automated grading.
* Points, badges, streak tracking, and student analytics dashboards.
* English Speaking practice with speech recognition and pronunciation feedback.
* StudyFeed with verified educational posts and strict minor protection filters.

### Phase 6 — Parent Dashboard & Security Enforcement
* Passcode-verified authentication with server-side token expiration.
* Daily study time limits and automatic lockout controls.
* Subject focus toggles (e.g., mandate 30 mins Mathematics before Games unlock).
* Weekly progress reports and learning activity monitoring.

### Phase 7 — Admin & Super Admin Portals
* School/District multitenant configuration on `admin.studyai.com`.
* Teacher curriculum assignment, classroom rosters, and exam authoring tools.
* Super Admin infrastructure monitoring on `superadmin.studyai.com` (AI provider health, token usage, billing, system feature flags, audit logging).

### Phase 8 — Production Hardening & Multiplatform Deployment
* Multi-stage Docker containers for FastAPI backend and web entrypoints.
* Supabase Cloud database syncing and automated migration execution.
* Multiplatform build validation:
  - Android APK & AAB generation via Flutter CLI.
  - iOS Archive & IPA verification via Xcode toolchain.
  - Flutter Web build optimization (Wasm / CanvasKit).
* End-to-end automated smoke tests and load testing.
