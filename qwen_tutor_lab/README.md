# `qwen_tutor_lab` — Standalone Qwen 2.5 7B Testing & Evaluation Environment

This directory is completely independent of the STUDYAI backend, database, and external APIs (GPT, Gemini, Grok/Groq). It communicates directly with the local Ollama server (`http://127.0.0.1:11434/api/chat`) to benchmark and improve `qwen2.5:7b` as an academic tutor.

## Files
- `generation_settings.json` — Hardware inspection metadata, baseline inference settings, and improved tutor inference settings.
- `prompts/baseline_system_prompt.txt` — Default Qwen 2.5 7B system prompt.
- `prompts/improved_system_prompt.txt` — Advanced academic teaching system prompt (Sections A–H: question classification, simple-first definitions, abbreviation full forms, explained glossary, 13-part deep teaching structure, Markdown comparison tables, exam-oriented practice with integrity disclaimers, structured visual specifications, and numerical verification).
- `benchmark_questions.json` — 17 educational test questions across Biology, Physics, Chemistry, Mathematics, Computer Science, and Exam Preparation.
- `rubric_evaluator.py` — 13-dimension deterministic rubric evaluator.
- `run_benchmark.py` — Standalone test runner communicating directly with `http://127.0.0.1:11434/api/chat`.
- `results/baseline_results.json` — Recorded baseline responses and scores (`6.54 / 10` mean).
- `results/improved_results.json` — Recorded improved responses and scores (`9.24 / 10` mean).
- `EVALUATION_REPORT.md` — Full quantitative and qualitative evaluation report.

## Running Standalone Tests

```bash
# Run both baseline and improved benchmarks
python3 qwen_tutor_lab/run_benchmark.py --mode both

# Run only baseline or only improved
python3 qwen_tutor_lab/run_benchmark.py --mode baseline
python3 qwen_tutor_lab/run_benchmark.py --mode improved

# Quick smoke test on first N questions
python3 qwen_tutor_lab/run_benchmark.py --mode improved --limit 3
```
