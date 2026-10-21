#!/usr/bin/env python3
"""
AI Tutor Dataset Exporter
Extracts curriculum pairs and SQLite conversation logs into standardized SFT format
(ChatML, Alpaca, ShareGPT) ready for future MLX / LoRA fine-tuning on Apple Silicon.
"""

import json
import sqlite3
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "studyai.sqlite"
SEED_PATH = BASE_DIR / "training_prep" / "seed_curriculum.jsonl"
OUTPUT_DIR = BASE_DIR / "training_prep" / "exports"


def export_seed_curriculum(target_format="chatml"):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / f"ai_tutor_{target_format}.jsonl"

    count = 0
    with open(SEED_PATH, "r", encoding="utf-8") as f_in, open(out_file, "w", encoding="utf-8") as f_out:
        for line in f_in:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            
            if target_format == "chatml":
                # Standard OpenAI / Qwen ChatML messages format
                entry = {
                    "messages": record["conversation"],
                    "metadata": {
                        "id": record["id"],
                        "grade": record["grade"],
                        "subject": record["subject"],
                        "language": record["language"],
                        "topic": record.get("topic")
                    }
                }
            elif target_format == "alpaca":
                # Standard Alpaca instruction / input / output
                user_msg = next((m["content"] for m in record["conversation"] if m["role"] == "user"), "")
                asst_msg = next((m["content"] for m in record["conversation"] if m["role"] == "assistant"), "")
                sys_msg = next((m["content"] for m in record["conversation"] if m["role"] == "system"), "")
                entry = {
                    "instruction": user_msg,
                    "input": sys_msg,
                    "output": asst_msg
                }
            else:
                entry = record

            f_out.write(json.dumps(entry, ensure_ascii=False) + "\n")
            count += 1

    print(f"✅ Exported {count} curriculum records to {out_file} (format: {target_format})")
    return out_file


def export_sqlite_conversations():
    if not DB_PATH.exists():
        print(f"⚠️ SQLite database not found at {DB_PATH}")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / "sqlite_conversations_chatml.jsonl"

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, topic, subject, level, mode FROM tutor_conversations")
        convs = cursor.fetchall()
        count = 0

        with open(out_file, "w", encoding="utf-8") as f_out:
            for conv_id, topic, subject, level, mode in convs:
                cursor.execute(
                    "SELECT role, content FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC",
                    (conv_id,)
                )
                raw_msgs = cursor.fetchall()
                if len(raw_msgs) < 2:
                    continue

                messages = []
                for role, content in raw_msgs:
                    if role in ("user", "assistant"):
                        messages.append({"role": role, "content": content})

                if messages:
                    entry = {
                        "messages": messages,
                        "metadata": {
                            "conversation_id": conv_id,
                            "topic": topic,
                            "subject": subject,
                            "level": level,
                            "mode": mode
                        }
                    }
                    f_out.write(json.dumps(entry, ensure_ascii=False) + "\n")
                    count += 1

        print(f"✅ Exported {count} SQLite conversations to {out_file}")
    finally:
        conn.close()


if __name__ == "__main__":
    fmt = sys.argv[1] if len(sys.argv) > 1 else "chatml"
    export_seed_curriculum(fmt)
    export_sqlite_conversations()
