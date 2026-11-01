#!/usr/bin/env python3
"""
STUDYAI — Phase 1 Standalone Qwen 2.5 7B Benchmark Runner & Evaluator
Communicates DIRECTLY with local Ollama (http://127.0.0.1:11434/api/chat).
Does NOT call GPT, Gemini, Grok, or any STUDYAI application code.
"""

import argparse
import json
import os
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, List

from rubric_evaluator import evaluate_response, RUBRIC_DIMENSIONS

LAB_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(LAB_DIR, "results")
os.makedirs(RESULTS_DIR, exist_ok=True)


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


def classify_question_directive(q_item: Dict[str, Any]) -> str:
    """
    Question classification & dynamic explanation-depth selector (Section 6)
    Appended as an explicit structural instruction in Improved mode.
    """
    task_type = q_item.get("task_type", "deep_explanation")
    category = q_item.get("category", "Science")
    requires_table = q_item.get("requires_table", False)
    requires_calc = q_item.get("requires_calculation", False)

    directives = [
        f"[Question Classification: Subject={category} | TaskType={task_type} | Level=Grade 10]"
    ]
    if task_type == "definition":
        directives.append(
            "Provide: (1) Precise Academic Definition, (2) Everyday Simple Explanation, (3) Formal Definition, "
            "(4) Concrete Example, (5) Terminology Clarification, (6) Essential vs. Advanced Key Terms (**Term**: meaning & relationship), "
            "(7) ### Visual Specification (Visual Type, Purpose, Essential Components & Labels, Section Association), and (8) 2 quick Self-Check Practice Questions with Model Answers (labeled as AI-Generated Practice Questions)."
        )
    elif task_type == "comparison" or requires_table:
        directives.append(
            "Include: (1) Multi-Tier Definitions (Precise, Everyday, Formal), (2) Explained Key Terms (**Term**: meaning), "
            "(3) Prerequisite foundation, (4) Step-by-Step Mechanism/Derivation & Formula/Equation, (5) Worked Example, "
            "(6) A Markdown Comparison Table (`| Feature | ... | ... |` with at least 5 rows), (7) Common Misconceptions, "
            "(8) ### Visual Specification (Visual Type, Purpose, Labels, Section Association), (9) Summary & 2 Practice Questions with Model Answers (labeled as AI-Generated Practice Questions)."
        )
    elif task_type == "numerical" or requires_calc:
        directives.append(
            "Include: (1) Concept Definition & Formula/Law, (2) Key Terms (**Term**: meaning), (3) Given Data in SI Units, "
            "(4) Step-by-Step Substitution & Calculation, (5) Final Answer with Units, (6) Explicit Verification Check substituting the answer back into the original equation, "
            "(7) Common Misconceptions, (8) ### Visual Specification (Visual Type, Purpose, Labels, Section Association), and (9) 1 similar Practice Problem with Answer."
        )
    else:
        directives.append(
            "Provide the complete structured academic lesson: (1) Introduction & Multi-Tier Definition (Precise, Everyday, Formal), "
            "(2) Essential & Advanced Key Terms (**Term**: meaning), (3) Prerequisites, (4) Step-by-Step Mechanism or Derivation, "
            "(5) Formula/Equation & Worked Example, (6) Markdown Comparison Table (`| Feature | ... |`), (7) Common Misconceptions, "
            "(8) ### Visual Specification (Visual Type, Purpose, Essential Components & Labels, Section Association), "
            "(9) Revision Summary, and (10) AI-Generated Practice Questions with Model Answers."
        )
    return "\n".join(directives)


def call_ollama_chat(
    base_url: str,
    model: str,
    system_prompt: str,
    user_content: str,
    options: Dict[str, Any],
    timeout_sec: int = 180,
) -> Dict[str, Any]:
    url = f"{base_url.rstrip('/')}/api/chat"
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "options": options,
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
        raw = resp.read().decode("utf-8")
        parsed = json.loads(raw)
    elapsed = round(time.perf_counter() - t0, 2)

    msg = parsed.get("message", {}).get("content", "")
    eval_count = parsed.get("eval_count", 0)
    eval_duration_ns = parsed.get("eval_duration", 1)
    tokens_per_sec = round(eval_count / (eval_duration_ns / 1e9), 2) if eval_duration_ns > 0 else 0.0

    return {
        "response_text": msg,
        "latency_sec": elapsed,
        "eval_tokens": eval_count,
        "prompt_eval_tokens": parsed.get("prompt_eval_count", 0),
        "tokens_per_sec": tokens_per_sec,
    }


def run_suite(mode: str, questions: List[Dict[str, Any]], settings: Dict[str, Any]) -> Dict[str, Any]:
    base_url = settings["ollama_base_url"]
    model = settings["model_tag"]

    if mode == "baseline":
        system_prompt = load_text(os.path.join(LAB_DIR, "prompts", "baseline_system_prompt.txt"))
        options = settings["baseline_options"]
    else:
        system_prompt = load_text(os.path.join(LAB_DIR, "prompts", "improved_system_prompt.txt"))
        options = settings["improved_options"]

    print(f"\n=======================================================")
    print(f"Running Standalone Qwen 2.5 7B Benchmark — Mode: {mode.upper()}")
    print(f"Model: {model} | Questions: {len(questions)}")
    print(f"=======================================================")

    records = []
    for idx, q in enumerate(questions, 1):
        user_prompt = q["question"]
        if mode == "improved":
            user_prompt = f"{q['question']}\n\n{classify_question_directive(q)}"

        print(f"[{idx}/{len(questions)}] ({q['category']}) {q['id']} ... ", end="", flush=True)
        res = call_ollama_chat(base_url, model, system_prompt, user_prompt, options)
        eval_res = evaluate_response(q, res["response_text"])
        print(
            f"Done in {res['latency_sec']}s ({res['tokens_per_sec']} tok/s) | "
            f"Score: {eval_res['overall_score_10']}/10"
        )

        records.append({
            "id": q["id"],
            "category": q["category"],
            "task_type": q["task_type"],
            "question": q["question"],
            "latency_sec": res["latency_sec"],
            "eval_tokens": res["eval_tokens"],
            "tokens_per_sec": res["tokens_per_sec"],
            "response": res["response_text"],
            "evaluation": eval_res,
        })

    # Compute aggregate rubric averages
    dim_averages = {}
    for dim in RUBRIC_DIMENSIONS:
        dim_averages[dim] = round(
            sum(r["evaluation"]["scores"][dim] for r in records) / max(1, len(records)), 2
        )

    overall_mean = round(
        sum(r["evaluation"]["overall_score_10"] for r in records) / max(1, len(records)), 2
    )
    avg_latency = round(sum(r["latency_sec"] for r in records) / max(1, len(records)), 2)
    avg_tps = round(sum(r["tokens_per_sec"] for r in records) / max(1, len(records)), 2)

    summary = {
        "mode": mode,
        "model": model,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "questions_count": len(records),
        "overall_score_10": overall_mean,
        "average_latency_sec": avg_latency,
        "average_tokens_per_sec": avg_tps,
        "dimension_averages": dim_averages,
        "options_used": options,
        "system_prompt_used": system_prompt,
        "records": records,
    }

    out_file = os.path.join(RESULTS_DIR, f"{mode}_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"--> Saved {mode} results to {out_file} (Overall Mean: {overall_mean}/10)")
    return summary


def main():
    parser = argparse.ArgumentParser(description="Standalone Qwen 2.5 7B Benchmark Harness")
    parser.add_argument("--mode", choices=["baseline", "improved", "both"], default="both")
    parser.add_argument("--limit", type=int, default=0, help="Optional limit on number of questions (0 = all 17)")
    args = parser.parse_args()

    settings = load_json(os.path.join(LAB_DIR, "generation_settings.json"))
    questions = load_json(os.path.join(LAB_DIR, "benchmark_questions.json"))
    if args.limit > 0:
        questions = questions[: args.limit]

    if args.mode in ("baseline", "both"):
        run_suite("baseline", questions, settings)
    if args.mode in ("improved", "both"):
        run_suite("improved", questions, settings)


if __name__ == "__main__":
    main()
