# STUDYAI — Comprehensive Existing Features Catalogue

This document inventories all functional features and capabilities present in the STUDYAI ecosystem as of Phase 1.

---

## 1. AI Tutor — Visual & Multimodal Learning
* **11-Step Pedagogical Progression**: Every student inquiry is decomposed into:
  1. Topic identification & grade leveling (Grades 1–10).
  2. Prerequisite identification.
  3. Logical topic hierarchy & subtopics breakdown.
  4. Core concept definitions & mechanisms.
  5. Multi-tier explanations (everyday simplicity vs. academic rigor).
  6. Mathematical formulas with reactants/products/catalysts or governing equations.
  7. Contrasting differences comparison tables (e.g., Covalent vs Ionic, Arteries vs Veins).
  8. Common misconceptions & exam traps to avoid.
  9. Real-life practical applications.
  10. Labeled visual diagram support with 7-part walkthroughs.
  11. Understanding self-check practice questions & natural follow-ups.
* **Multilingual Instruction**: English, natural Telugu script (తెలుగు), and natural Hindi script (हिंदी) with technical terms preserved in parentheses.
* **Interactive Visual Element Selection (Section H)**: Students click any labeled part of a diagram or 3D model (e.g., *Left Ventricle*, *SA Node*, *Adenine*, *Thylakoid Lumen*), which highlights the component and opens targeted prompt chips (*"Explain this part"*, *"What if it fails?"*, *"How does it connect?"*).
* **Curriculum Subtopic Navigation**: Horizontal subtopic navigation pills allowing 1-click exploration of individual subtopics.
* **Streaming SSE Chat**: FastAPI `/api/tutor/chat` endpoint supporting real-time token streaming.

---

## 2. AI Notes — NotebookLM-Inspired Learning Studio
* **Multi-Source Ingestion Pipeline**:
  - **Topic-to-Notebook**: Synthesizes organized multi-section study guides with verified scientific diagrams.
  - **PDF Document Processing**: Ingests multi-page academic textbooks with page-by-page chunking and precise bracketed page citations (`[Page 1]`, `[Page 2]`).
  - **YouTube Video Lecture Analysis**: Extracts transcripts, key takeaways, and timestamped citations (`[12:45]`).
  - **Multi-Source Synthesis & Contradiction Detection**: Reconciles multiple documents or web links, identifying conflicting facts or dates.
* **Interactive Notebook Editor**: In-place paragraph editing, section renaming, table cell editing, and visual diagram reordering.
* **Automated Study Tools**: Generates 5–10 interactive study flashcards and 5-question multiple choice quizzes grounded in the source text.
* **Grounded Source Q&A**: Answers student questions strictly from source documents with bracketed citations.
* **Multi-Format Export**: One-click export to printable clean white-page HTML, formatted Word (`.doc`), and Markdown (`.md`).

---

## 3. Interactive 3D Learning Lab (Three.js v0.170.0)
* **Centralized Three.js Engine**: Hosted in [`visual_learning/three.js/`](file:///Users/vishwaksai/Downloads/AI%20APP/visual_learning/three.js/) using the official upstream release.
* **Procedural Anatomical & Scientific Generators**:
  - **Human Heart**: 4 chambers, tricuspid and mitral valves, ascending aorta, pulmonary trunk, glowing SA node pacemaker, and realistic pulsating cycle.
  - **DNA Double Helix**: Antiparallel 5′→3′ and 3′→5′ sugar-phosphate ribbons, complementary A=T and G≡C base pairs with exact hydrogen bond rungs.
  - **Chloroplast & Photosynthesis**: Double lipid envelope, stroma matrix, stacked thylakoid grana discs, and sunlight photon stream.
  - **Bohr Atomic Model**: Clustered proton/neutron nucleus, quantized K/L electron shells, and orbiting valence electrons.
  - **Solar System**: The Sun with corona, Keplerian orbital tracks, terrestrial inner planets, asteroid belt, and Saturn ring system.
  - **Hydrological Water Cycle**: Ocean reservoir, mountain catchment, evaporation vapor arrows, cloud condensation, and rainfall precipitation.
* **Navigation Controls**: 360° Orbit rotation, Pan, Zoom, Reset camera, Fullscreen toggle, and automatic WebGL context-loss recovery.
* **Flutter Integration Architecture**: [`visual_learning/flutter_studyai_visual/`](file:///Users/vishwaksai/Downloads/AI%20APP/visual_learning/flutter_studyai_visual/) providing cross-platform Flutter Web IFrame and Mobile WebView bridges.

---

## 4. Adaptive Educational Games
* **Space Answer Shooter 3D**:
  - Three.js WebGL space environment with starfield, player spacecraft, target asteroid obstacles, and floating answer spheres.
  - Grade-appropriate curriculum question bank (`curriculumBank.ts`) spanning Mathematics, Physics, Chemistry, and Biology.
  - Real-time scoring, streak multipliers, sound effects, accuracy tracking, and mistake review summaries.
  - Persistent game session records in `game_sessions` table.

---

## 5. Natural Audio Lessons (TTS Engine)
* **Multi-Provider Neural Narration**: ElevenLabs Multilingual v2 + Google Gemini Neural TTS + clean WAV synthesizer fallback.
* **Audio Caching**: In-memory and database asset caching indexed by hash of `topic + text + voice + speed` for sub-millisecond replay.
* **Persistent Bottom Player**: Global audio bar supporting play, pause, seek, 0.75x–1.5x speed adjustment, and synchronized lesson script view.

---

## 6. Shared Learning Ecosystem Context
* **Cross-Module Topic Synchronization**: Selecting a topic in the AI Tutor automatically syncs context to AI Notes, 3D Lab, Games, and Library via the `shared_topic_context` store.
* **Student Dashboard**: Real-time streak count, daily study goal progress, subject performance radar/bars, and recent activity timeline.
* **Parent Dashboard**: Token-authenticated portal with secure passcode verification (default: `2468`), daily time limits, subject focus controls, and weekly mastery analytics.
* **Resource Library**: Unified repository of student-created notes, saved 3D model configurations, diagrams, audio lessons, and examination reports.

---

## 7. Security & Video Generation Restriction
* **Server-Controlled Video Disable**: `FEATURE_VIDEO_GENERATION = false` enforced server-side.
* **Immediate 403 Forbidden**: Requests to `/api/media/video` are rejected with `403 Forbidden` (`code: 'FEATURE_DISABLED'`).
* **UI Protection**: No video generation interfaces or trigger buttons are exposed to students, teachers, or administrators.
