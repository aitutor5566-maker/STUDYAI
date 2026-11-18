# STUDYAI — AI Learning & 3D Adventure Ecosystem

<div align="center">

![STUDYAI Hero Banner](docs/images/studyai_hero_banner.jpg)

[![Live App](https://img.shields.io/badge/Live%20App-richards--involves--provinces--totally.trycloudflare.com-0EA5E9?style=for-the-badge&logo=cloudflare&logoColor=white)](https://richards-involves-provinces-totally.trycloudflare.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.170.0-000000?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Live URL:** [https://richards-involves-provinces-totally.trycloudflare.com](https://richards-involves-provinces-totally.trycloudflare.com)

Interactive **AI Personal Teacher**, **Visual Lesson Map**, **AI Notes & Voice Audio**, and **AAA Three.js 3D Educational Games**.

</div>

---

## Core Platform

| Module | Highlights | Code |
| :--- | :--- | :--- |
| **AI Teacher & Tutor** | Multi-model routing (**Qwen 2.5**, **Gemini**, **OpenAI**, **Groq**) with topic accuracy, step-by-step numericals & integrated Lesson Map. | [`server/multiModelAiTeacherEngine.ts`](server/multiModelAiTeacherEngine.ts) |
| **Shared 3D AAA Engine** | Procedural PBR (`map`, `normalMap`, `roughnessMap`, `aoMap`, `metalnessMap`), GLSL animated water, volumetric clouds, IBL & bloom. | [`src/games/engine/VisualMasterpieceEngine.ts`](src/games/engine/VisualMasterpieceEngine.ts) |
| **Progression & Quality** | 7-state [`QuestionProgressionMachine`](src/games/ProgressionController.ts), multi-level worlds, student-isolated saved progress & `low`–`ultra` auto-detection. | [`src/games/ProgressionController.ts`](src/games/ProgressionController.ts) |
| **AI Notes & Audio** | Continuous curriculum notes, educational diagrams, and multilingual voice playback. | [`server/advancedNotesGenerationEngine.ts`](server/advancedNotesGenerationEngine.ts) |

---

## 3D Educational Games

All games feature free-roam or arcade flight controls, fullscreen support, mobile virtual joysticks, and automatic multi-level world progression.

| Shadow Ninja & Minecraft Realms | Sky Striker — Knowledge Flight |
| :---: | :---: |
| ![Shadow Ninja Realms](docs/images/shadow_ninja_realms.jpg) | ![Sky Striker 3D](docs/images/sky_striker_3d.jpg) |
| Dual-world Realm Portal: bamboo temples, GLSL river & live voxel block building across 3 realms & 3 biomes. | PBR fighter jet flight through 5 worlds (`Desert Storm` to `Sky Kingdom`) with multi-camera views & holographic gates. |

| Study Rush 3D — Magic Village | Katana: Shadow Warriors |
| :---: | :---: |
| ![Study Rush 3D](docs/images/study_rush_3d_showcase.jpg) | ![Katana Shadow Warriors](docs/images/katana_shadow_warriors.jpg) |
| Explore 5 evolving village worlds (*Science Village* to *Frost Citadel*), gather resources & defend against Enemy AI waves. | Moonlit dojo battles with PBR stone arenas, reflection pool, active Enemy AI & multi-arena progression. |

| War of Words — Vocabulary Quest |
| :---: |
| ![War of Words 3D](docs/images/war_of_words_3d.jpg) |
| 3D platformer across *Moonlight Valley* & *Shadow Forest* with Answer Sentinels, moonlit water & instant question progression. |

*Also includes **Space Battle 3D** ([`SpaceBattleEngine.ts`](src/games/spaceBattle/SpaceBattleEngine.ts)), **Answer Runner 3D**, and **Answer Shooter 3D**.*

---

## Quick Start

```bash
npm install
npm run build
npm start   # http://localhost:3001
```

## Verification

```bash
# 3D Game Engine, AI, Progression & Access Tests (Vitest)
npx vitest run src/games/progressionController.test.ts src/games/engine/visualMasterpieceEngine.test.ts src/games/engine/enemyAiController.test.ts src/games/shadowNinjaRealms/shadowNinjaRealms.test.ts src/games/skyStriker/skyStriker.test.ts src/games/studyRush3d/studyRush3d.test.ts src/games/warOfWords/warOfWords.test.ts src/services/gameAccessService.test.ts
```
