# STUDYAI — Production System Architecture Specification

**Version:** 1.0 (Phase 1 Baseline)  
**Classification:** Production Architectural Blueprint  
**Target Domains:** `studyai.com` • `admin.studyai.com` • `superadmin.studyai.com` • `api.studyai.com` • `assets.studyai.com`

---

## 1. Architectural Overview

STUDYAI is architected as a **modular monorepo** supporting five independently buildable, deployable, and manageable application experiences powered by a central **FastAPI** backend and **PostgreSQL / Supabase** infrastructure.

```
                              ┌─────────────────────────────────────────┐
                              │            STUDYAI ECOSYSTEM            │
                              └────────────────────┬────────────────────┘
                                                   │
         ┌─────────────────────────────────────────┼────────────────────────────────────────┐
         │                                         │                                        │
┌────────▼──────────────┐             ┌────────────▼──────────┐              ┌──────────────▼────────────┐
│      STUDENT APP      │             │     ADMIN PORTAL      │              │    SUPER ADMIN PORTAL     │
│   (Android, iOS, Web) │             │     (Flutter Web)     │              │       (Flutter Web)       │
│      studyai.com      │             │   admin.studyai.com   │              │   superadmin.studyai.com  │
└────────┬──────────────┘             └────────────┬──────────┘              └──────────────┬────────────┘
         │                                         │                                        │
         └─────────────────────────────────────────┼────────────────────────────────────────┘
                                                   │ HTTPS / REST / SSE / WebSockets
                                      ┌────────────▼──────────┐
                                      │   CENTRAL FASTAPI     │
                                      │   api.studyai.com     │
                                      └────────────┬──────────┘
                                                   │
         ┌─────────────────────────────────────────┼────────────────────────────────────────┐
         │                                         │                                        │
┌────────▼──────────────┐             ┌────────────▼──────────┐              ┌──────────────▼────────────┐
│  AI ORCHESTRATION     │             │  POSTGRESQL / SUPABASE│              │    THREE.JS VISUAL LAB    │
│  Gemini / GPT / Groq  │             │  Auth • DB • RLS      │              │    assets.studyai.com     │
│  Ollama (Optional)    │             │  Storage Buckets      │              │    Official Three.js 170  │
└───────────────────────┘             └───────────────────────┘              └───────────────────────────┘
```

---

## 2. Five Application Experiences

### 2.1 Student Application (`apps/student_app/`)
* **Platforms**: Android (APK/AAB), iOS (IPA), and Web (PWA / WebAssembly).
* **Domain**: `studyai.com`
* **Core Capabilities**: AI Tutor, AI Notes, 3D Lab, Educational Games, Audio Lessons, Progress Analytics, Schedule, Practice Quizzes, and Student Profile.
* **Architecture**: Flutter Clean Architecture utilizing BLoC / Riverpod for state management, `flutter_studyai_visual` for WebGL 3D rendering, and local SQLite/Hive caching for offline study resilience.

### 2.2 Admin Portal (`apps/admin_portal/`)
* **Platform**: Dedicated Flutter Web deployment.
* **Domain**: `admin.studyai.com`
* **Core Capabilities**: School / Class curriculum management, student enrollment oversight, assignment grading, weekly examination authoring, teacher-student communication, and learning analytics.
* **Security**: Role-Based Access Control (`role = 'admin'` or `'teacher'`), multi-factor authentication (MFA), and tenant isolation.

### 2.3 Super Admin Portal (`apps/superadmin_portal/`)
* **Platform**: Isolated Flutter Web deployment on dedicated network tier.
* **Domain**: `superadmin.studyai.com`
* **Core Capabilities**: Platform-wide tenant management, AI provider health & billing monitoring, system feature flags, audit logging, database maintenance, and emergency kill-switches.
* **Security**: Strict IP whitelisting, hardware key MFA, and isolated authentication scope.

### 2.4 Central Backend Service (`backend/`)
* **Platform**: Python 3.11+ / FastAPI asynchronous REST service.
* **Domain**: `api.studyai.com`
* **Responsibilities**: Authentication verification, AI model orchestration, lesson synthesis, PDF/YouTube extraction, examination grading, audio generation, and data persistence.

### 2.5 Shared Data Infrastructure (`database/`)
* **Platform**: PostgreSQL 16 managed via Supabase.
* **Key Components**:
  - **Supabase Auth**: JWT issuing, password hashing (bcrypt), social login, and MFA.
  - **Row Level Security (RLS)**: Enforces cryptographic boundaries between students, parents, and administrative staff.
  - **Supabase Storage**: S3-compatible object buckets for textbook PDFs, audio WAV files, and visual diagrams.

---

## 3. Backend System Architecture

```
backend/app/
├── api/
│   └── v1/
│       ├── endpoints/
│       │   ├── auth.py          # Registration, login, session tokens
│       │   ├── tutor.py         # AI Tutor chat, streaming SSE, subtopic navigation
│       │   ├── notes.py         # Source extraction (PDF/YouTube), synthesis, Q&A
│       │   ├── visual.py        # Visual plan retrieval, SVG diagram regeneration
│       │   ├── assessment.py    # Quizzes, exams, score calculations
│       │   ├── games.py         # Game session state, answer verification
│       │   ├── parent.py        # Passcode verification, parental controls
│       │   ├── admin.py         # Curriculum & user administration
│       │   └── media.py         # Audio lessons, 3D specs, video restriction enforcement
│       └── router.py            # API V1 router aggregation
├── core/
│   ├── config.py                # Pydantic BaseSettings loading from environment
│   ├── logging.py               # Structured JSON logger
│   └── exceptions.py            # Custom HTTP exceptions and error handlers
├── models/                      # SQLAlchemy / SQLModel database entities
├── schemas/                     # Pydantic v2 validation models
├── services/                    # Core business logic (Tutor, Notes, Visual, Audio)
├── repositories/                # Database query layer (CRUD)
├── middleware/                  # Request timing, student context, CORS, rate limits
├── security/                    # JWT decoder, role guards, password hasher
└── ai/                          # Multi-provider orchestration layer
```

---

## 4. AI Orchestration Layer

The AI architecture implements the **Provider Adapter Pattern**, decoupling business logic from underlying LLM vendors.

```
                             ┌────────────────────────┐
                             │   ProviderRouter       │
                             │   (Model Orchestrator) │
                             └───────────┬────────────┘
                                         │
         ┌───────────────────────────────┼──────────────────────────────┐
         │                               │                              │
┌────────▼──────────┐          ┌─────────▼─────────┐          ┌─────────▼─────────┐
│   GeminiAdapter   │          │   OpenAIAdapter   │          │    GroqAdapter    │
│  (Google Gemini   │          │   (GPT-4o-mini,   │          │   (DeepSeek,      │
│   Flash & Pro)    │          │    DALL-E 3)      │          │    Llama 3.3)     │
└───────────────────┘          └───────────────────┘          └───────────────────┘
         │                               │                              │
         └───────────────────────────────┼──────────────────────────────┘
                                         │ Failover / Offline
                               ┌─────────▼─────────┐
                               │   OllamaAdapter   │
                               │   (Local Qwen     │
                               │    2.5 7B)        │
                               └───────────────────┘
```

* **Routing Strategy**:
  - High Speed & Low Latency: Routed to Groq (`llama-3.3-70b` / `gpt-oss-120b`).
  - Multimodal Reasoning & Image Generation: Routed to Google Gemini (`gemini-3.8-flash`).
  - Structured Formatting & Edge Verification: Routed to OpenAI (`gpt-4o-mini`).
  - Offline & Local Execution: Routed to local Ollama (`qwen2.5:7b`).
* **Security Rule**: All provider API keys reside strictly on the server; clients never receive provider credentials.

---

## 5. Video Generation Restriction (Section 7)

```
Incoming Request: POST /api/v1/media/video
       │
       ▼
Feature Flag Check: FEATURE_VIDEO_GENERATION == False
       │
       ├──[True]──► HTTP 403 Forbidden
       │            { "code": "FEATURE_DISABLED", "error": "Video generation is disabled." }
       │            (Terminate immediately with zero external API calls)
       │
       └──[False]─► Future Video Pipeline (Currently Unreachable)
```

Video generation requests are strictly terminated at the network boundary. No usable video generation interface or API trigger is exposed in the student, Admin, or Super Admin applications.

---

## 6. Monorepo Directory Layout

```
studyai/
├── apps/
│   ├── student_app/             # Main Flutter multiplatform client
│   ├── admin_portal/            # Web management portal for educators/admins
│   └── superadmin_portal/       # Tenant & platform infrastructure console
├── backend/
│   ├── app/                     # FastAPI core application
│   └── tests/                   # Backend pytest suite
├── database/
│   ├── migrations/              # Versioned SQL schema definitions
│   ├── policies/                # Row Level Security (RLS) policies
│   └── seeds/                   # Initial curriculum and demo data
├── visual_learning/
│   ├── three.js/                # Upstream Three.js v0.170.0 single source
│   ├── engine/                  # Unified WebGL Visual Learning Engine
│   └── flutter_studyai_visual/  # Multiplatform Flutter bridge package
├── packages/
│   ├── shared_models/           # Reusable data transfer objects
│   ├── shared_ui/               # Glassmorphism design tokens & widgets
│   └── shared_services/         # Reusable API & offline cache clients
├── infrastructure/
│   ├── docker/                  # Multi-container Docker Compose definitions
│   ├── deployment/              # Production environment configurations
│   └── ci_cd/                   # GitHub Actions automated workflows
├── docs/                        # Architecture & setup documentation
└── tests/                       # Monorepo acceptance & regression test suites
```
