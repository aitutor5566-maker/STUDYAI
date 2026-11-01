# STUDYAI — Known Limitations & Architectural Constraints

**Document Date:** November 2026  
**Applicability:** Master Prompt 3 Production Baseline  

---

## 1. Intentional Architectural Constraints

1. **Video Generation Restriction**:
   - *Constraint*: AI video generation is permanently locked across the backend, returning `HTTP 403 Forbidden` (`FEATURE_DISABLED`).
   - *Rationale*: Compliance with platform safety policies and focus on verified interactive 3D simulations and curriculum-accurate SVG vector diagrams.
2. **Student Chat Confidentiality**:
   - *Constraint*: Parents cannot view student private AI Tutor chats by default unless explicit institutional or student consent is verified.
   - *Rationale*: Fosters open learning, question exploration, and psychological safety for students while preserving academic progress and test visibility for parents.
3. **Points Segregation**:
   - *Constraint*: Platform gamified XP and reward points cannot be applied toward official academic grades or examination marks.
   - *Rationale*: Anti-farming and academic integrity compliance.
4. **Super Admin MFA Requirement**:
   - *Constraint*: Super Admin accounts cannot log in via the standard `/auth/login` endpoint without a verified 6-digit TOTP MFA token.
   - *Rationale*: Enterprise defense against credential stuffing and privilege escalation attacks.

---

## 2. External Dependencies & Operational Considerations

1. **App Store Review Cycles**:
   - While Android App Bundle (`.aab`) and iOS Xcode workspaces are fully configured, live distribution requires Apple App Store Connect and Google Play Console developer account approval.
2. **Ollama Local LLM Fallback**:
   - When external LLM cloud providers (Gemini, Groq) are unreachable or rate-limited, the system seamlessly falls back to deterministic curriculum engines and local Ollama (`qwen2.5:7b`).
