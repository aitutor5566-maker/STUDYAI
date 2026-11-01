# STUDYAI — Known Issues & Architectural Technical Debt

**Date:** November 2026  
**Status:** Phase 1 Architectural Registry

---

## 1. Environment & Toolchain Considerations

### 1.1 Flutter & Dart Installation Required on Host
* **Issue**: The `flutter` and `dart` commands are not currently installed on the host system's standard terminal PATH.
* **Impact**: While the Flutter package files (`pubspec.yaml`, `lib/`, platform adapters, and bridge contracts) are fully specified and architected, local compilation requires the Flutter SDK.
* **Remediation**:
  1. Download Flutter SDK for macOS (Apple Silicon: `flutter_macos_arm64_*.zip`).
  2. Extract to `~/development/flutter` and append to PATH:
     ```bash
     export PATH="$HOME/development/flutter/bin:$PATH"
     ```
  3. Run `flutter doctor` to verify Android SDK, Xcode, and Chrome toolchains.

### 1.2 Python Environment Execution Permissions
* **Issue**: In sandboxed execution environments, virtualenv binaries symlinked to user home directories (`/Users/.../.local/bin/python3`) may encounter sandbox permission barriers.
* **Remediation**: Use standard system Python (`/usr/bin/python3`) or Docker containerization (`infrastructure/docker/`) for reproducible, sandboxed-independent backend execution.

---

## 2. Architecture & Technical Debt

### 2.1 Dual-Backend Consolidation Path
* **Issue**: The codebase currently runs a Node.js Express server (`server/index.ts`, port 3001) alongside a FastAPI server (`fastapi_server/main.py`, port 8000).
* **Impact**: Duplication of routing and configuration logic across two languages.
* **Remediation**: Phase 1 establishes the production unified FastAPI architecture under `backend/app/` with Pydantic v2 schemas. Node.js Express is maintained in parallel during Phase 1 to preserve 100% passing status on existing test suites, with full consolidation completed in Phase 2.

### 2.2 Database Migration from SQLite to PostgreSQL / Supabase
* **Issue**: Existing data resides in a local SQLite file (`data/studyai.sqlite`).
* **Impact**: SQLite lacks multi-tenant concurrency, Row Level Security (RLS) enforcement, and cloud synchronization.
* **Remediation**: Comprehensive PostgreSQL migration DDL files (`database/migrations/001_initial_schema.sql` and `database/policies/002_rls_policies.sql`) are authored in Phase 1 to migrate all tables, indexes, and RLS policies into Supabase.

### 2.3 Strict Video Generation Enforcement
* **Issue**: Third-party video generation APIs (Runway ML, etc.) are immature, cost-prohibitive, and lack pedagogical precision for K-12 instruction.
* **Remediation**:
  - `FEATURE_VIDEO_GENERATION = false` is enforced on both Node and FastAPI backends, returning `403 Forbidden` (`code: 'FEATURE_DISABLED'`).
  - No video generation UI triggers or controls exist in student or admin client applications.
  - Interactive Three.js 3D models and verified scientific SVG diagrams are used exclusively for visual instruction.

### 2.4 Terminal Sandbox Socket Isolation
* **Issue**: Executing standalone scripts that attempt raw network connections (`fetch('http://localhost:3001')`) inside macOS sandbox mode fails with `EPERM` socket restrictions.
* **Remediation**: Test suites (`tests/ecosystem.test.ts`, `tests/verify_notes_tests_1_to_8.mjs`, `tests/verify_visual_tutor_acceptance.mjs`) employ in-memory `createAppServer()` request dispatching via `node:events`, allowing test verification with zero network socket dependency.
