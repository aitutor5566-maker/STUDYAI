# STUDYAI — Approved Production Technology Stack

This document formalizes the approved architectural technology choices for STUDYAI across all five ecosystem applications and services.

---

## 1. Approved Technology Standards

| Domain | Approved Technology | Justification & Architectural Role |
| :--- | :--- | :--- |
| **Primary Frontend** | **Flutter & Dart** | Cross-platform unity across Android, iOS, and Web from a single codebase; high-performance 60fps Skia/Impeller rendering pipeline; robust offline SQLite/Hive storage for offline study resilience. |
| **Web Entrypoints** | **Flutter Web** | Consistent design tokens, state management, and component reuse across Student Web (`studyai.com`), Admin Portal (`admin.studyai.com`), and Super Admin Portal (`superadmin.studyai.com`). |
| **Backend Framework** | **Python 3.11+ / FastAPI** | Asynchronous high-throughput ASGI framework; native Pydantic v2 data validation; seamless integration with AI/ML toolchains (Ollama, PyTorch, LangChain, NumPy) and async database drivers (`asyncpg`). |
| **Data Serialization** | **Pydantic v2** | High-performance Rust-backed data validation and schema enforcement for all incoming API payloads and responses. |
| **Relational Database** | **PostgreSQL 16** | ACID-compliant enterprise relational engine with JSONB support, spatial indexing, full-text search, and automated foreign key cascades. |
| **BaaS & Auth Platform** | **Supabase** | Managed PostgreSQL, Supabase Auth (JWT, MFA, OAuth), Row Level Security (RLS) policies, and Supabase Storage for educational assets. |
| **Visual Learning & 3D** | **Three.js v0.170.0** | Industry standard WebGL/WebGPU graphics library; zero-dependency native rendering of interactive anatomical and scientific 3D models. |
| **Visual Bridge** | **JavaScript / TypeScript Bridge** | Two-way communication channel between Flutter host surfaces and WebGL canvas via `JavaScriptChannel` (mobile) and `postMessage` (web). |
| **Containerization** | **Docker & Docker Compose** | Reproducible multi-service deployment orchestrating FastAPI, PostgreSQL, and static web containers across development and production environments. |
| **CI / CD** | **GitHub Actions (YAML)** | Automated linting, test execution, container builds, and deployment verification on every push and pull request. |
| **Configuration** | **Environment-Based (`.env`)** | Twelve-Factor App methodology; separation of configuration from code with strict backend isolation of third-party API credentials. |

---

## 2. Transition Plan from React Prototype to Flutter Monorepo

During earlier experimental phases, a React 18 / Vite SPA was utilized for rapid interface prototyping and user feedback. The production architecture transitions the application into Flutter:

1. **Flutter Visual Bridge Reusability**: The Three.js visual learning engine developed under [`visual_learning/three.js/`](file:///Users/vishwaksai/Downloads/AI%20APP/visual_learning/three.js/) and [`visual_learning/flutter_studyai_visual/`](file:///Users/vishwaksai/Downloads/AI%20APP/visual_learning/flutter_studyai_visual/) directly interfaces with Flutter, ensuring zero loss of 3D anatomical and scientific generators.
2. **Schema & Model Consistency**: Backend API response contracts (structured 11-step lesson JSON, 7-part image walkthroughs, notebook sections, citations) remain identical between backends, ensuring Flutter consumes existing tested payloads.
3. **Dual-Stack Preservation in Phase 1**: The working React frontend is preserved to guarantee zero downtime while the multi-app Flutter structure is provisioned in `apps/`.
