# STUDYAI — AI Learning & 3D Adventure Ecosystem

<div align="center">

![STUDYAI Hero Banner](docs/images/studyai_hero_banner.jpg)

[![Live App](https://img.shields.io/badge/Live%20App-stronger--claire--golf--rover.trycloudflare.com-0EA5E9?style=for-the-badge&logo=cloudflare&logoColor=white)](https://stronger-claire-golf-rover.trycloudflare.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.170.0-000000?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

> **Live URL:** [https://stronger-claire-golf-rover.trycloudflare.com](https://stronger-claire-golf-rover.trycloudflare.com)

**One Topic → One Complete Learning Journey.**  
An interactive AI learning platform combining a **Multi-Model AI Teacher**, an **Interactive Lesson Map & 6-Phase Exam Roadmap**, **AI Notes & Audio**, and **AAA Three.js 3D Educational Games**.

</div>

---

## Core Pillars

| Pillar | What It Does | Key Files |
| :--- | :--- | :--- |
| **Multi-Model AI Teacher** | Routes between **Qwen 2.5** (Primary Brain), **GPT Knowledge Bank & RAG**, and **Gemini Research** with Math/Physics/Chemistry step-by-step solvers & chemical equation atom verification. | [`server/multiModelAiTeacherEngine.ts`](server/multiModelAiTeacherEngine.ts) |
| **Interactive Lesson Map** | Visual syllabus graph (`Class → Subject → Unit → Chapter → Lesson`) with pan/zoom, prerequisite locking, Formula Connection Map, 6-Phase Exam Roadmap, and Parent/Teacher view. | [`src/pages/LessonMapPage.tsx`](src/pages/LessonMapPage.tsx), [`server/lessonMapEngine.ts`](server/lessonMapEngine.ts) |
| **Universal 3D Engine** | Shared PBR texture generator, `EffectComposer` + `UnrealBloomPass`, `PMREMGenerator` IBL reflections, atmospheric sky dome, volumetric shafts, and GPU resource disposal. | [`src/games/engine/VisualMasterpieceEngine.ts`](src/games/engine/VisualMasterpieceEngine.ts), [`src/games/engine/PbrTextureFactory.ts`](src/games/engine/PbrTextureFactory.ts) |
| **3D Learning Games** | **Shadow Ninja: Minecraft Realms**, **Sky Striker** (fighter jet flight + landing gear + multi-camera), **Study Rush 3D — Survival Night**, and **War of Words**. | [`src/games/shadowNinjaRealms/`](src/games/shadowNinjaRealms/), [`src/games/skyStriker/`](src/games/skyStriker/) |
| **AI Notes & Voice Audio** | Continuous topic-complete notes with curriculum diagrams and teacher-style multilingual Notes-to-Audio playback. | [`server/advancedNotesGenerationEngine.ts`](server/advancedNotesGenerationEngine.ts), [`server/voiceTeachingEngine.ts`](server/voiceTeachingEngine.ts) |

---

## STUDY RUSH 3D — Game Showcase

<div align="center">

![STUDY RUSH 3D Showcase](docs/images/study_rush_3d_showcase.jpg)

</div>

- **Shadow Ninja : Minecraft Realms** — Switch seamlessly via the in-world **Realm Portal** between an articulated Shadow Ninja (Pagoda Temple, Bamboo Grove, Sakura trees, flowing waterfall) and Minecraft Realms (voxel biomes, crystal caves, live 3D block placement).
- **Sky Striker — Knowledge Flight** — Pilot a PBR-textured fighter jet with retractable landing gear, wingtip strobes, multi-camera views (`standard`, `cinematic`, `cockpit`, `side`), and volumetric cloud skies.
- **Study Rush 3D — Survival Night & War of Words** — Explore open-world biomes by day, defend the village by night, or battle Answer Sentinels in Moonlight Valley.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build production frontend
npm run build

# 3. Start production server (http://localhost:3001)
npm start
```

### Run Verification Suites

```bash
# Frontend & 3D Game Engine Unit Tests (Vitest)
npx vitest run src/games/shadowNinjaRealms/shadowNinjaRealms.test.ts src/games/engine/visualMasterpieceEngine.test.ts src/games/skyStriker/skyStriker.test.ts src/games/warOfWords/warOfWords.test.ts src/games/studyRush3d/studyRush3d.test.ts src/services/gameAccessService.test.ts

# Backend AI Teacher & Lesson Map Integration Tests
node --experimental-strip-types --test tests/multi_model_ai_teacher.test.ts
node --experimental-strip-types --test tests/lesson_map_engine.test.ts
```

---

## Architecture Overview

```
React 18 + Vite + Three.js (src/)
   ├── /lesson-map   ──▶ Interactive Syllabus Graph, Formula Map & Exam Roadmap
   ├── /tutor        ──▶ AI Tutor + Embedded 3D Games Launcher
   ├── /notes        ──▶ Continuous AI Notes + Educational Diagrams + Audio
   └── /languages    ──▶ Language Learning + War of Words 3D

Node.js + SQLite Backend (server/)
   ├── /api/ai-teacher/*  ──▶ Qwen 2.5 + GPT Knowledge Bank/RAG + Gemini Research
   ├── /api/lesson-map/*  ──▶ Prerequisites, Real Mastery Tracking & Exam Roadmaps
   └── /api/tutor/*       ──▶ Streaming Chat, Numericals & Adaptive Profiles
```
