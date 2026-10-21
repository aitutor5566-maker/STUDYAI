# AI Tutor — Fine-Tuning Strategy & Apple Silicon Feasibility Report

> **Notice on Current Implementation Status:**  
> The current system operates using the base model `qwen2.5:7b` with the configured Ollama alias `ai-tutor` and centralized dynamic pedagogical prompting. No weights have been altered or trained yet. This document establishes the exact roadmap and configuration for future parameter-efficient fine-tuning (PEFT).

---

## 1. Hardware Feasibility on Current MacBook Air

### Hardware Profile:
- **SoC:** Apple M-Series (Apple Silicon)
- **Unified Memory:** 16 GB LPDDR5
- **Available Storage:** 366+ GB SSD
- **Compute Frameworks:** Apple MLX (`mlx-lm`) or PyTorch with MPS (Metal Performance Shaders)

### Memory Budget Analysis for Qwen2.5-7B:
| Component | 16-bit Full Precision | 4-bit QLoRA / MLX LoRA (Recommended) |
|---|---|---|
| Base Model Weights | ~14.5 GB | **~4.2 GB** |
| LoRA Adapter Weights ($r=16$) | N/A | **~45 MB** |
| KV Cache & Activations (Seq Len 2048) | ~1.8 GB | **~1.1 GB** (with gradient checkpointing) |
| Optimizer States (AdamW 8-bit / Adafactor) | ~7.2 GB | **~1.8 GB** |
| **Total Peak VRAM Required** | **> 23.5 GB (OOM on 16GB)** | **~7.14 GB (Fits comfortably within 16GB)** |

**Feasibility Verdict:**  
Full parameter fine-tuning is impossible on 16GB. However, **4-bit quantized LoRA (QLoRA) or MLX LoRA using `mlx-lm` is 100% feasible and runs natively on Apple Silicon with 0 out-of-memory risk**.

---

## 2. Recommended Fine-Tuning Hyperparameters

```yaml
base_model: "Qwen/Qwen2.5-7B-Instruct"
quantization: "4bit" (bitsandbytes or MLX 4-bit)
peft_strategy: "LoRA"

lora_parameters:
  r: 16
  lora_alpha: 32
  lora_dropout: 0.05
  target_modules:
    - "q_proj"
    - "k_proj"
    - "v_proj"
    - "o_proj"
    - "gate_proj"
    - "up_proj"
    - "down_proj"

training_hyperparameters:
  learning_rate: 2e-4
  lr_scheduler_type: "cosine"
  warmup_ratio: 0.03
  batch_size: 1
  gradient_accumulation_steps: 8
  max_seq_length: 2048
  gradient_checkpointing: true
  weight_decay: 0.01
  epochs: 3
```

---

## 3. Dataset Composition & Preventing Catastrophic Forgetting

To prevent the model from forgetting English reasoning or degrading in multilingual fluency, the training split must maintain a strict balanced curriculum ratio:

| Category | Proportion | Purpose |
|---|---|---|
| **English STEM & Humanities (Grades 1–10)** | 40% | Core conceptual clarity, definitions, and derivations |
| **Telugu (తెలుగు) Educational Dialogues** | 25% | Natural Telugu script, formal school grammar, and bilingual terms |
| **Hindi (हिंदी) Educational Dialogues** | 25% | Standard Devanagari terminology, worked problems, and board questions |
| **General Reasoning Replay Anchor (GSM8K/MMLU)** | 10% | Preserves general logic, arithmetic verification, and anti-forgetting |

---

## 4. Target Loss & Evaluation Metrics

1. **Training & Validation Loss:**
   - Target training loss: $0.90 - 1.10$
   - Target validation loss: $0.95 - 1.15$ (monitor for overfitting divergence)
2. **Textbook Benchmark Perplexity:**
   - Perplexity on unseen NCERT / State Board textbook validation sets: $\le 4.2$
3. **Multilingual Fluency Metrics:**
   - Telugu translation & QA chrF++ score: $\ge 52.0$
   - Hindi translation & QA chrF++ score: $\ge 58.0$
4. **Teaching Sequence Adherence:**
   - Human evaluation verifying the presence of:
     1. Familiar hook
     2. Step-by-step logic
     3. Real-world analogy
     4. Diagnostic check question

---

## 5. Execution Pipeline (When Approved)

When ready to execute fine-tuning on Apple Silicon:
```bash
# 1. Install MLX LM
pip install mlx-lm

# 2. Run LoRA Fine-Tuning using the exported dataset
python -m mlx_lm.lora \
  --model Qwen/Qwen2.5-7B-Instruct \
  --train \
  --data training_prep/exports/ \
  --batch-size 1 \
  --lora-layers 16 \
  --iters 600

# 3. Fuse Adapter and Convert to GGUF
python -m mlx_lm.fuse --model Qwen/Qwen2.5-7B-Instruct --adapter-path adapters/ --export-gguf

# 4. Import to Ollama
ollama create ai-tutor:v1 -f Modelfile.trained
```
