# STUDYAI — Production API Specification (FastAPI v2)

Base URL: `http://localhost:8000/api/v1` (Production: `https://api.studyai.com/api/v1`)

Interactive OpenAPI Docs: `http://localhost:8000/docs` or `http://localhost:8000/redoc`

---

## 1. Authentication & Session Management (`/api/v1/auth`)

### `POST /auth/login`
Universal login for Student, Parent, Admin, and Accountant accounts.
- **Body**: `{"email": "...", "password": "..."}`
- **Response**: JWT token containing `sub`, `email`, `role`, `tenant_id`, `permissions`.

### `POST /auth/superadmin/login`
Elevated Super Administrator login requiring mandatory MFA.
- **Body**: `{"email": "...", "password": "...", "mfa_code": "123456"}`
- **Security**: Fails with `401 Unauthorized` (`code: 'INVALID_MFA_TOKEN'`) if MFA code is invalid or missing.

### `POST /auth/register/student`
Self-service student enrollment. Automatically generates student profile and CBSE grade association.
- **Body**: `{"email": "...", "password": "...", "full_name": "...", "grade": "Grade 10", "board": "CBSE"}`

### `POST /auth/register/parent`
Self-service guardian registration.
- **Body**: `{"email": "...", "password": "...", "full_name": "...", "phone": "..."}`

### `GET /auth/me`
Retrieves token claims, active user record, and granular permission scopes.
- **Header**: `Authorization: Bearer <token>`

---

## 2. Role-Based Access Control & Escalation Prevention (`/api/v1/roles`)

### `GET /roles`
Lists all built-in roles (`superadmin`, `admin`, `accountant`, `student`, `parent`, `custom`) and their permissions.

### `POST /roles/assign`
Assigns a role to a target user.
- **Header**: `Authorization: Bearer <token>` (Admin or Superadmin)
- **Body**: `{"user_id": "...", "role": "superadmin"}`
- **Security Check**: Blocks role escalation (`403 Forbidden`, `code: 'ROLE_ESCALATION_BLOCKED'`). Only a Superadmin can assign Admin or Superadmin privileges; Admins cannot elevate users to Superadmin or assign roles higher than their own.

---

## 3. Parent-Child Relationship & Strict Student Privacy (`/api/v1/parent`)

### `GET /parent/children`
Returns only verified linked children for the calling guardian.

### `GET /parent/children/{child_id}/progress`
Accesses learning metrics, study time, and exam history.
- **Security Check**: Fails with `403 Forbidden` (`code: 'LINK_NOT_FOUND'`) if relationship is unlinked or pending.

### `GET /parent/children/{child_id}/conversations`
Student AI conversation logs.
- **Security Check (Strict Privacy)**: By default, student chats are confidential. Fails with `403 Forbidden` (`code: 'STUDENT_CHAT_CONFIDENTIAL'`) unless `allow_chat_view` consent is explicitly granted.

---

## 4. Examination Engine & Automated Scoring (`/api/v1/examinations`)

### `GET /examinations`
Lists published assessments and mock exams.

### `GET /examinations/{exam_id}`
Returns exam details. Answer keys and question explanations are strictly stripped when accessed by students.

### `POST /examinations/{exam_id}/submit`
Submits exam answers. The server auto-grades submissions against the answer key, computes total score, percentage, percentile, question-by-question feedback, and awards gamified points.

---

## 5. Storage & Secure Document Uploads (`/api/v1/library`)

### `POST /library/upload`
Uploads curriculum documents and assets with strict server-side validation:
- **Max File Size**: 10MB limit (fails with `413 Payload Too Large`).
- **MIME Whitelist**: Only approved formats (`application/pdf`, `image/png`, `image/jpeg`, etc.).
- **Magic Bytes Validation**: Binary headers verified against actual content (fails with `400 MAGIC_BYTES_MISMATCH` if content does not match reported header).

---

## 6. System Governance & Telemetry (`/api/v1/superadmin`)

### `GET /superadmin/audit-logs`
Queries tamper-evident security audit logs recording actor ID, role, action, target resource, and ISO timestamps.

### `PATCH /superadmin/feature-flags/{flag_key}`
Updates feature flags.
- **UNIVERSAL VIDEO PROHIBITION**: Attempting to enable `video_generation` is blocked server-side (`403 Forbidden`, `code: 'FEATURE_DISABLED'`) for all roles, including Superadmin.

---

## 7. Media & Video Generation Prohibition (`/api/v1/media`)

### `POST /media/video` & `GET /media/video/{id}`
Universal server-level prohibition:
```json
{
  "detail": {
    "error": "Forbidden",
    "message": "AI Video generation is strictly disabled in production policy",
    "code": "FEATURE_DISABLED"
  }
}
```
Status: `403 Forbidden` across all roles and users.

---

## 8. Advanced AI Tutor, Visual Teaching & Three.js (`/api/v1/tutor`)

### `POST /tutor/ask`
Generates a complete, pedagogical 14-section curriculum lesson with deterministic labeled SVGs and mapped Three.js 3D models.
- **Request Body**:
  ```json
  {
    "topic": "Human Heart and Blood Circulation",
    "question": "How do heart chambers and valves coordinate blood flow?",
    "grade": 10,
    "level": "Grade 10",
    "subject": "Biology",
    "language": "English",
    "mode": "detailed"
  }
  ```
- **Response Structure (14 Sections)**:
  - `lesson_id`: Persistent unique lesson identifier (`les_...`)
  - `topic`, `subject`, `level`
  - `prerequisites`: Required prior knowledge array
  - `learning_objectives`: Key outcomes array
  - `topic_overview`: High-level summary
  - `detailed_explanation`: Pedagogical explanation tailored to academic level
  - `subtopics`: Subtopics array with titles and granular concepts
  - `definitions`: Scientific definitions dictionary
  - `abbreviations`: Expanded acronyms with full forms and roles (e.g. SA Node, AV Node, RBC, ATP, DNA)
  - `step_by_step_processes`: Chronological stages
  - `real_world_examples`: Relatable contextual examples
  - `key_points`: Core summary takeaways
  - `common_misconceptions`: Identified false beliefs and scientific corrections
  - `applications`: Real-world technological and medical applications
  - `topic_summary`: Concise review
  - `understanding_questions`: Assessment multiple-choice questions with answer keys and rationale
  - `visual_representations`: Deterministic high-contrast labeled SVGs with Lesson ID association and accessibility captions
  - `three_js_model`: Model metadata (`model_id`, `type`, `recommended_view`, `interactive_parts`)

### `POST /tutor/follow-up`
Maintains conversational pedagogical context for follow-up teacher interactions.
- **Request Body**:
  ```json
  {
    "action_type": "simpler | step_by_step | explain_part | another_example | compare",
    "topic": "Human Heart",
    "current_lesson_id": "les_...",
    "selected_part": "Left Ventricle"
  }
  ```
- **Response**: Contextual explanation answering the student's learning request with continuity.

### `GET /tutor/audio` & `POST /tutor/audio`
Synthesizes clear, structured educational voice narration and transcript for auditory learning.
- **Parameters**: `lesson_id`, `topic`
- **Response**: WAV audio stream with `x-narration-script` metadata header or JSON narration breakdown.

### `POST /tutor/save-to-notes`
Converts an AI Tutor lesson directly into an AI Study Notebook with auto-generated flashcards and self-check quiz.
- **Request Body**:
  ```json
  {
    "lesson_id": "les_...",
    "student_id": "usr_student_001",
    "notebook_title": "Human Heart & Circulation Notes"
  }
  ```
- **Response**: Created `StudyNote` record with persistent note ID, folder tags, flashcards, and review quiz.

---

## 9. AI Notes Studio, Centralized Library & 3D Lab (`/api/v1/notes`, `/api/v1/library`, `/api/v1/visual-3d`)

### `POST /notes/generate`
Generates an organized, subject-tailored AI Study Notebook from any topic, lesson, PDF, image, or video transcript source.
- **Request Body**:
  ```json
  {
    "topic": "Newton's Laws of Motion",
    "subject": "Physics",
    "level": "Grade 10",
    "source_type": "topic | lesson | pdf | image | document | video",
    "lesson_id": null,
    "content": "...",
    "metadata": { "fileName": "...", "url": "..." }
  }
  ```
- **Response**: Complete study notebook with subject-differentiated formatting (formulas, tables, SVG diagrams, definitions, flashcards, and self-check MCQs).

### `POST /notes/{note_id}/autosave`
Lightweight debounced autosave endpoint to prevent loss of student edits.
- **Request Body**: `{"content_markdown": "...", "title": "..."}`
- **Response**: `{"status": "autosaved", "last_autosaved_at": "...", "version": 2}`

### `GET /notes/{note_id}/versions` & `POST /notes/{note_id}/versions/{version_id}/restore`
Retrieves snapshots and allows instant rollback to any historical version.

### `GET /notes/{note_id}/export?format=markdown|html|json`
Exports study notebooks as clean Markdown, standalone styled HTML (with KaTeX formulas and embedded vector SVGs), or structured JSON.

### `GET /library`
Centralized personal learning library aggregating:
- `notes` (AI Study Notebooks)
- `pdf` / `document` (Uploaded textbooks & syllabus)
- `model3d` (Procedural Three.js 3D simulations)
- `game` (Interactive learning arcades)
- `diagram` (High-contrast SVG concept maps)
- Query parameters: `type`, `subject`, `q`, `sort`, `tag`, `favorites_only`.

### `POST /library/{resource_id}/favorite`
Toggles favorite bookmark for the calling student.

### `GET /library/collections` & `POST /library/collections`
Manages custom student learning playlists and curriculum bundles.

### `GET /visual-3d/models` & `POST /visual-3d/save-to-library`
Accesses 7 procedural 3D models with camera presets (rotate, zoom, pan, reset) and bookmarks models into the student's personal library.

---

## 10. Adaptive Educational Games, Points & Weekly Examinations (`/api/v1/games`, `/api/v1/points`, `/api/v1/examinations`)

### `GET /games/catalog` & `POST /games/questions`
- Catalog of three adaptive learning games:
  1. `answer_battle` (Concept Duel: round-based fighting progression)
  2. `space_shooter` (Astro Interceptor 3D: shooting-style educational arcade)
  3. `learning_runner` (Concept Path Runner: adaptive preference runner)
- `POST /games/questions`: Generates curriculum questions with hints, explanations, and misconception alerts.
- `POST /games/sessions`: Validates scores, enforces anti-cheat rules, and awards backend-calculated points.

### `GET /points/balance` & `POST /points/claim-reward`
- Authoritative backend balance (total points, XP, level, streak). Platform points are strictly segregated from academic marks.
- `POST /points/claim-reward`: Enforces strict deduplication (`claim_key: user_id:event:ref`) to prevent duplicate claims and farming.
- `GET /points/leaderboard`: Returns peer rankings based on authoritative points.

### `POST /examinations/generate-questions`
Generates draft questions across 8 supported types for human admin review:
`mcq`, `multiple_select`, `true_false`, `fill_blank`, `matching`, `numerical`, `short_answer`, `diagram`.

### `POST /examinations` & `POST /examinations/{id}/start` & `POST /examinations/{id}/submit`
- **Admin Configuration**: Week, duration, pass percentage, max attempts, retake rules, and question sets.
- **Student Exam Workflow**:
  - `GET /examinations/{id}` sanitizes answers and explanations during the test.
  - `POST /examinations/{id}/start` starts the timed attempt.
  - `POST /examinations/{id}/save-progress` autosaves answers and review flags against network drops.
  - `POST /examinations/{id}/submit` grades all 8 question types, computes marks, percentage, topic-wise accuracy (Strong/Moderate/Needs Revision), improvement trend, and awards platform points.

---

## 11. School Admin Portal & Enterprise Super Admin Console (`/api/v1/admin`, `/api/v1/superadmin`)

### Independent Multi-App Architecture & Deployments
STUDYAI enforces physical separation between the school-level administrative interface and the enterprise super administrator console:
- **School Admin Portal**: Target `admin.studyai.com` (`apps/admin_portal`, Dockerfile.admin, Port 3002).
- **Enterprise Super Admin Console**: Target `superadmin.studyai.com` (`apps/superadmin_portal`, Dockerfile.superadmin, Port 3003).

### School Admin Endpoints (`/api/v1/admin`)
- `GET /admin/dashboard/stats`: Tenant-scoped summary metrics (active students, examinations, average score, AI tutor questions answered).
- `GET /admin/students`: Tenant student roster with enrollment, grades, streaks, and progress status.
- `GET /admin/parents`: Parent-student linkage telemetry and verified relationship status.
- `GET /admin/curriculum`: Curriculum tree with subjects, topics, and subtopics.
- `GET /admin/ai-monitoring/tutor`: Live telemetry on AI tutor sessions, average latency, and topic distributions.
- `GET /admin/ai-monitoring/diagrams`: Audit of SVG/vector diagrams generated for curriculum topics.
- `GET /admin/finance/summary`: School tuition, payment receipts, and collection rates. Accessible by `admin` and `accountant`.
- `GET /admin/accountant/overview`: Specialized accountant ledger view.
- `GET /admin/reports/export`: Formal academic cohort, financial, or attendance export in CSV format.
- `POST /admin/users/provision`: Admin user provisioning. Enforces `prevent_role_escalation` (Admins cannot create Superadmins, `403 ROLE_ESCALATION_BLOCKED`).

### Accountant Role Boundary
- Accounts with `role: accountant` have access only to financial telemetry (`/admin/finance/summary`, `/admin/accountant/overview`).
- Calls to student rosters (`/admin/students`), private chats, curriculum deletion, or system settings return `403 Forbidden`.

### Super Admin Enterprise Endpoints (`/api/v1/superadmin`)
- `POST /auth/superadmin/login`: Requires valid email, master password, and verified 6-digit TOTP/MFA token.
- `GET /superadmin/overview`: Global platform metrics across all tenant schools, total users, token consumption, and monthly operational spend.
- `GET /superadmin/tenant-admins`: Provisioned school administrator directories.
- `GET /superadmin/rbac-matrix`: Global role definitions and granular permission mapping.
- `GET /superadmin/ai-providers`: Masked AI provider configurations. Raw API keys are never exposed (`api_key_masked: sk-proj-****************`).
- `GET /superadmin/ai-usage-analytics`: Detailed token usage, latency (P95), error rates, and multi-provider billing breakdown.
- `GET /superadmin/system-health`: Health status across FastAPI gateway, PostgreSQL/Supabase, Ollama inference node, and Three.js engine.
- `PUT /superadmin/feature-flags/{flag_key}`: Updates feature flags. **Universal Security Rule**: Video generation (`video_generation`) is permanently locked; even elevated Super Admins receive `403 FEATURE_DISABLED` if attempting to enable it.
- `GET /superadmin/audit-logs`: Paginated tamper-evident security audit trails with actor IDs, roles, actions, and ISO timestamps.
- `GET /superadmin/deployment-status`: Health and CI/CD status for all three isolated targets (`studyai.com`, `admin.studyai.com`, `superadmin.studyai.com`).




