# STUDYAI — Phase 1 Project Audit & Codebase Inspection

**Audit Timestamp:** November 2026  
**Auditor:** Principal Software Architect, Senior Flutter Engineer, Backend Architect & DevOps Engineer  
**Audit Purpose:** Comprehensive Phase 1 architectural evaluation of the STUDYAI codebase prior to production monorepo consolidation.

---

## 1. Executive Summary

STUDYAI is an advanced multimodal educational learning ecosystem designed to guide students through the continuous mastery loop:
$$\text{Learn} \longrightarrow \text{Understand} \longrightarrow \text{Visualize} \longrightarrow \text{Notes} \longrightarrow \text{Practice} \longrightarrow \text{Games} \longrightarrow \text{Analyze} \longrightarrow \text{Improve} \longrightarrow \text{Schedule} \longrightarrow \text{Progress}$$

The existing workspace hosts working implementations across multiple subsystems:
1. **Interactive Client UI**: React 18 / Vite SPA with glassmorphism UI tokens, featuring AI Tutor, AI Notes (NotebookLM-style), Library, 3D Lab, Games, English Speaking, Parent Dashboard, Feed, and Schedule.
2. **Node.js Express Backend (`server/`)**: Serving `/api/` endpoints with SQLite (`DatabaseSync`), multi-provider AI adapters (`aiAdapter.ts`), specialized SVG diagram synthesis (`visualIntelligenceEngine.ts`), and source-to-notebook engines (`notesNotebookEngine.ts`).
3. **Python FastAPI Backend (`fastapi_server/`)**: FastAPI server (`main.py`) providing streaming SSE chat and Ollama Qwen 2.5 7B connectivity.
4. **Visual Learning Engine (`visual_learning/`)**: Single-source Three.js v0.170.0 integration with custom procedural geometries (DNA double helix, 4-chamber human heart, chloroplast, atomic shells, solar system, water cycle) and Flutter Dart bridge package (`visual_learning/flutter_studyai_visual`).
5. **Evaluation Laboratory (`qwen_tutor_lab/`)**: Standalone Qwen 2.5 7B benchmark client and rubric verification suite.

---

## 2. Directory & Module Inventory

| Directory / Module | Language / Framework | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `src/` | TypeScript / React 18 / Vite | Current web frontend covering 10 educational pages, modals, and games. | **Active & Functional** |
| `server/` | TypeScript / Node.js 24 | Express REST API server, SQLite persistence, LLM adapter layer, notes synthesis, SVG visual generator. | **Active & Functional** |
| `fastapi_server/` | Python 3 / FastAPI / Pydantic | Lightweight Python backend for Ollama Qwen streaming and local inference. | **Active & Functional** |
| `visual_learning/three.js/` | JavaScript (ESM) | Upstream official Three.js v0.170.0 build and addons (MIT License). Single source of truth. | **Active & Verified** |
| `visual_learning/engine/` | TypeScript | `VisualLearningEngine.ts`: Scene, camera, lighting, procedural geometry, interaction, memory management. | **Active & Functional** |
| `visual_learning/flutter_studyai_visual/` | Dart / Flutter | Multiplatform Flutter package for embedding Three.js WebGL with two-way JSON bridge. | **Active & Tested** |
| `data/` | SQLite (`studyai.sqlite`) | Local relational storage with seed profiles for Vishwak Sai and Aarav Sharma. | **Active** |
| `qwen_tutor_lab/` | Python | Standalone test harness for Ollama Qwen 2.5 7B evaluation. | **Lab Prototype** |
| `realistic-voxel-game/` | TypeScript / Three.js | Standalone procedural voxel sandbox prototype. | **Prototype / Standalone** |
| `backup_pre_space_battle/` | TypeScript / React | Historical backup of game files before 3D Space Battle refactor. | **Archival / Unused** |
| `training_prep/` | Python | Scripts for Qwen training dataset curation. | **Lab Script** |
| `tests/` | JavaScript / Node.js | Automated regression suites (`ecosystem.test.ts`, `verify_notes_tests_1_to_8.mjs`, `verify_visual_tutor_acceptance.mjs`). | **Active & 100% Passing** |

---

## 3. Technology Stack Evaluation

### 3.1 Frontend
- **Current State**: React 18.3 + Vite 6.4 + Lucide React icons + HTML5 Canvas / WebGL.
- **Approved Target**: **Flutter & Dart** (Mobile: Android/iOS; Web: Flutter Web) for cross-platform unity, native performance, uniform canvas rendering, and offline mobile deployment.
- **Architectural Action**: Maintain the working React web app while establishing the production Flutter monorepo under `apps/student_app`, `apps/admin_portal`, and `apps/superadmin_portal`.

### 3.2 Backend
- **Current State**: Dual backend setup — Node.js Express (`server/index.ts`, port 3001) handling general REST/business logic + Python FastAPI (`fastapi_server/main.py`, port 8000) handling local Ollama streaming.
- **Approved Target**: **Centralized Python FastAPI** with Pydantic v2 schemas, SQLAlchemy/asyncpg or Supabase Python client, organized cleanly under `backend/app/`.

### 3.3 Database & Authentication
- **Current State**: SQLite via `node:sqlite` (`data/studyai.sqlite`) with tables for users, learning preferences, study goals, tutor conversations, messages, notes, library resources, generation jobs, quizzes, game sessions, and learning activity.
- **Approved Target**: **PostgreSQL & Supabase** with Supabase Auth, Row Level Security (RLS) policies per student/parent/admin, Supabase Storage buckets for PDFs/assets, and automated migration scripts.

### 3.4 AI Integrations & Providers
- **Live Providers Supported**:
  - Google Gemini (`gemini-3.8-flash`, `gemini-3.1-flash-image`)
  - OpenAI (`gpt-4o-mini`, DALL-E 3)
  - Groq (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`)
  - ElevenLabs Neural TTS (`eleven_multilingual_v2`)
  - Local Ollama (`qwen2.5:7b`)
  - Local Curated Curriculum Engine (offline fallback)

---

## 4. Key Findings, Technical Debt & Security Analysis

1. **Flutter & Dart System Availability**:
   - Flutter and Dart binaries are not currently installed on the host's system PATH.
   - *Remediation*: The Flutter project structure, Dart packages, and configuration will be created in full production specification. Instructions for local Flutter SDK installation will be documented.
2. **Video Generation Restriction (Section 7 Enforced)**:
   - Automated video generation is strictly prohibited from client exposure across all roles.
   - `FEATURE_VIDEO_GENERATION = false` is enforced on the backend returning `403 Forbidden` (`code: 'FEATURE_DISABLED'`). The UI displays an informational security dialog and rejects any video generation attempts.
3. **Database Migration Path**:
   - SQLite relational tables need a direct 1:1 migration mapping into PostgreSQL DDL with proper UUID primary keys, foreign key constraints with `ON DELETE CASCADE`, and Row Level Security (RLS) policies.
4. **Isolated Deployments**:
   - Currently, all routes exist in a single web client. Production requires separation into Student App, Admin Portal, and Super Admin Portal with discrete authentication barriers.

---

## 5. Audit Conclusion

The existing codebase contains robust, high-value educational logic, scientific SVG generators, verified Three.js models, and automated test suites. Phase 1 will cleanly establish the **production monorepo foundation** (`apps/`, `backend/`, `database/`, `visual_learning/`, `packages/`, `infrastructure/`, `docs/`) without deleting working functionality.
