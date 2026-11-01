# STUDYAI — Complete AI-Powered Learning Ecosystem

**Core Product Principle:** `One Topic → One Complete Learning Journey`

## Architecture Overview
- **Frontend**: React 18 + TypeScript + Vite + React Router v6 + Lucide Icons + Three.js (`src/`)
- **Design System**: Premium Apple Glass UI (`src/styles/apple-glass.css`) using exact specification tokens (`#FFFFFF`, `#FF6A00`, `#E85D00`, `#FFF3E8`, `#202124`, `#6B7280`, `rgba(255,255,255,0.55)`, `rgba(255,255,255,0.58)`, `rgba(255,106,0,0.13)`)
- **Backend & API**: Node.js HTTP API Server (`server/index.ts`) & Configurable AI Provider Adapter (`server/aiAdapter.ts`)
- **Database**: Native SQLite (`node:sqlite` in `server/db.ts`) persisting users, parent sessions, preferences, goals, tutor conversations, notes, library resources, media jobs, quizzes, game sessions, and learning activity.

## Quick Start & Commands

```bash
# Ensure Node v24+ is in PATH
export PATH="$HOME/.nvm/versions/node/v24.22.0/bin:$PATH"

# 1. Run automated integration tests (9 end-to-end suites)
npm test

# 2. Build production frontend bundle
npm run build

# 3. Start full-stack production server on http://localhost:3001
npm start

# 4. Or run development mode (Backend on :3001 + Vite HMR on :5173)
npm run dev
```

## Parent Dashboard Server Authorization
- Default server-verified Parent Passcode: `2468` (hashed with SHA-256 in `users.parent_passcode_hash` and verified via `POST /api/parent/auth` before issuing a bearer session token).
# STUDYAI
