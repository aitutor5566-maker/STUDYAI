# Standalone Qwen 2.5 7B Evaluation & Teaching Improvement Report (`qwen_tutor_lab`)

## 1. Local Ollama & Hardware Inspection
- **Installed Models Verified**:
  - `qwen2.5:7b` (Blob ID: `845dbda0ea48`, 4.7 GB)
  - `ai-tutor:latest` (Blob ID: `0967a4408f0c`, 4.7 GB, derived from `qwen2.5:7b`)
- **Model Architecture & Specifications**:
  - Family: `qwen2` (Instruction-tuned with ChatML `<|im_start|>` template & tool-calling support)
  - Parameter Size: `7.6B` (`7,615,616,512` parameters)
  - Quantization Level: `Q4_K_M`
  - Context Length: `32,768` tokens (`embedding_length: 3584`)
- **System Hardware & Environment**:
  - SoC: **Apple M5** (Unified Memory Architecture)
  - RAM: **16 GB** (`17,179,869,184` bytes)
  - Ollama Version: `0.40.11`
  - Local API Endpoint: `http://127.0.0.1:11434/api/chat`
- **Verification**: All 17 baseline and 17 improved evaluations in this phase were executed directly against `http://127.0.0.1:11434/api/chat` using `qwen2.5:7b` in complete isolation from STUDYAI's backend, database, and external APIs (no GPT, Gemini, or Grok/Groq calls). No model weights were fine-tuned; all improvements come from system-prompt engineering, task-specific structural directives, and inference parameter tuning.

---

## 2. Generation Settings Comparison

| Parameter | Baseline Configuration | Improved Tutor Configuration | Rationale |
| :--- | :--- | :--- | :--- |
| `temperature` | `0.70` | `0.25` | Reduces numerical/stoichiometric drift and enforces structural adherence |
| `top_p` | `0.90` | `0.88` | Focuses token sampling on high-confidence academic terminology |
| `top_k` | `40` | `35` | Tightens vocabulary selection |
| `repeat_penalty` | *(default 1.1)* | `1.08` | Prevents repetitive phrasing across long 13-part lessons |
| `num_ctx` | `4096` | `8192` | Ensures full 13-part lessons + examples + exam questions never truncate context |
| `num_predict` | `1400` | `2200` | Allows complete multi-section explanations, comparison tables, and model answers |

---

## 3. Rubric Dimension Averages (17 Benchmark Questions across 6 Domains)

| # | Evaluation Dimension | Baseline Mean (`/10`) | Improved Mean (`/10`) | Delta (`Δ`) |
| :--- | :--- | :---: | :---: | :---: |
| 1 | Factual Correctness | `7.78` | `8.39` | **+0.61** |
| 2 | Definition Accuracy (Multi-Tier + Full Forms) | `5.15` | `9.88` | **+4.73** |
| 3 | Key-Term Completeness (Explained Glossary) | `4.40` | `10.00` | **+5.60** |
| 4 | Explanation Depth (Simple → Mechanism → Why) | `4.98` | `9.42` | **+4.44** |
| 5 | Logical Organization | `7.35` | `9.65` | **+2.30** |
| 6 | Appropriate Detail for Question Type | `8.76` | `9.50` | **+0.74** |
| 7 | Example Quality | `6.59` | `8.68` | **+2.09** |
| 8 | Comparison Accuracy (Markdown Tables + Prose) | `4.68` | `9.09` | **+4.41** |
| 9 | Calculation Correctness & Verification | `8.15` | `8.38` | **+0.23** |
| 10 | Exam-Question Relevance & Honest Disclaimer | `5.68` | `8.85` | **+3.17** |
| 11 | Citation & Claim Integrity | `9.50` | `9.50` | **0.00** |
| 12 | Correct Visual Planning (`### Visual Specification`) | `3.00` | `9.50` | **+6.50** |
| 13 | Clarity & Readability | `9.04` | `9.20` | **+0.16** |
| — | **OVERALL BENCHMARK SCORE** | **6.54 / 10** | **9.24 / 10** | **+2.70 (+41.3%)** |

- **Average Latency**: Baseline `39.05s` (`18.68 tok/s`) → Improved `94.89s` (`15.83 tok/s`, producing comprehensive 13-section lessons with comparison tables, visual plans, and practice questions).

---

## 4. Question-by-Question Benchmark Results (17 Questions)

| # | Question ID | Subject | Task Type | Baseline (`/10`) | Improved (`/10`) | Delta (`Δ`) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| 1 | `bio_1_what_is_dna` | Biology | Definition | `6.51` | `8.74` | **+2.23** |
| 2 | `bio_2_dna_structure_pairing` | Biology | Deep Explanation | `6.35` | `9.30` | **+2.95** |
| 3 | `bio_3_dna_vs_rna` | Biology | Comparison | `6.48` | `9.38` | **+2.90** |
| 4 | `bio_4_photosynthesis` | Biology | Deep Explanation | `6.37` | `9.39` | **+3.02** |
| 5 | `phys_1_newtons_laws` | Physics | Deep Explanation | `6.88` | `9.45` | **+2.57** |
| 6 | `phys_2_speed_vs_velocity` | Physics | Comparison | `5.54` | `9.52` | **+3.98** |
| 7 | `phys_3_force_numerical` | Physics | Numerical | `5.49` | `7.52` | **+2.03** |
| 8 | `chem_1_atomic_structure` | Chemistry | Deep Explanation | `6.77` | `9.45` | **+2.68** |
| 9 | `chem_2_ionic_vs_covalent` | Chemistry | Comparison | `6.64` | `9.28` | **+2.64** |
| 10 | `chem_3_chemical_equation` | Chemistry | Deep Explanation | `6.57` | `9.21` | **+2.64** |
| 11 | `math_1_quadratic_equations` | Mathematics | Deep Explanation | `6.72` | `9.44` | **+2.72** |
| 12 | `math_2_quadratic_formula_derivation` | Mathematics | Deep Explanation | `6.25` | `9.37` | **+3.12** |
| 13 | `math_3_solve_and_verify` | Mathematics | Numerical | `6.08` | `9.29` | **+3.21** |
| 14 | `cs_1_variables_and_functions` | Computer Science | Deep Explanation | `6.92` | `9.44` | **+2.52** |
| 15 | `cs_2_arrays_vs_linked_lists` | Computer Science | Comparison | `7.08` | `9.45` | **+2.37** |
| 16 | `cs_3_binary_search_algorithm` | Computer Science | Deep Explanation | `7.25` | `9.32` | **+2.07** |
| 17 | `exam_1_photosynthesis_exam_prep` | Exam Preparation | Exam Prep | `7.32` | `9.45` | **+2.13** |

---

## 5. Failure Analysis & Architectural Takeaways for Phase 2 Integration

### Weaknesses Corrected by Prompt & Parameter Engineering:
1. **Simple Everyday Explanation Before Technical Jargon**: Baseline Qwen immediately started with technical phrasing. The improved prompt enforces a two-tier definition (Everyday Simple Analogy first, followed by Precise Academic & Formal Definitions).
2. **Full Forms & Explained Glossary**: Baseline Qwen mentioned abbreviations (`DNA`, `ATP`, `RNA`) without systematically expanding and explaining their roles. Improved Qwen achieves `10.0/10` on key-term completeness by separating **Essential Core Terms** from **Advanced Vocabulary** and expanding full forms on first mention.
3. **Comparison Tables**: Baseline Qwen frequently used bullet lists for comparisons (`4.68/10`). Improved Qwen consistently generates multi-row Markdown comparison tables (`9.09/10`).
4. **Structured Visual Planning**: Baseline Qwen never planned diagrams (`3.00/10`). Improved Qwen outputs structured `### Visual Specification` blocks (`9.50/10`) detailing visual type, required labels, and section association without falsely claiming to have rendered an image itself.

### Remaining Limitations Requiring Phase 2 Multimodal Orchestrator:
1. **Actual Media Synthesis**: As a text-only local LLM, `qwen2.5:7b` can only specify visual blueprints—it cannot render raster images, SVG diagrams, multi-scene videos, neural TTS audio, or interactive 3D WebGL geometry on its own.
2. **Latency on Full 13-Section Lessons**: Generating 1,400+ tokens locally on Apple M5 takes ~60–110s when unconstrained, whereas interactive tutoring in STUDYAI requires fast structured JSON + parallel specialist media generation (Gemini Nano Banana + Scientific SVG Engine, ElevenLabs/Gemini Neural TTS, Runway/Multi-Scene Animated Video Studio, and Three.js 3D Lab).
