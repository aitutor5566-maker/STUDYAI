# STUDYAI — Enterprise Security & Compliance Audit Report

**Report Date:** November 2026  
**Auditor:** Principal Application Security Engineer  
**Security Status:** ALL ACCESS CONTROLS, ENCRYPTION, AND RLS POLICIES VERIFIED  

---

## 1. Authentication & Role-Based Access Control (RBAC)

The system implements strict, server-side RBAC across 6 defined platform roles:

| Role | Access Level | Restrictions & Boundaries | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Global Platform Governance | Requires Password + 6-digit TOTP MFA; standard login rejected (`MFA_REQUIRED`) | Verified in test `AUTH_3` |
| **School Admin** | School Tenant Scoped | Restricted to assigned tenant; blocked from global settings (`/superadmin/overview` -> 403 Forbidden) | Verified in test `RBAC_1` |
| **Accountant** | Financial Reports & Ledger | Strictly isolated from student chat logs and AI provider settings | Verified in test `RBAC_2` |
| **Student** | Personal Learning Journey | Strictly isolated from administrative portals (`/admin/overview` -> 403 Forbidden) and other students' notes | Verified in test `RBAC_3` |
| **Parent** | Linked Children Telemetry | Access granted only to verified children; student private chats confidential (`STUDENT_CHAT_CONFIDENTIAL`) | Verified in test `JOURNEY_S21` |
| **Custom Role** | Granular Capability Matrix | Explicitly assigned permissions; escalation prevented | Verified in test suite |

---

## 2. Row Level Security (RLS) & Multi-Tenant Data Isolation

PostgreSQL migration `004_phase2_comprehensive_schema.sql` establishes 39 normalized tables with RLS enabled across all critical entities:
1. `users` & `student_profiles`: Scoped to tenant ID and authenticated user ID.
2. `ai_notes`: Scoped to `user_id == auth.uid()`. Cross-student reading and modification attempts are rejected.
3. `examination_attempts`: Students only read and modify their own in-progress and evaluated attempts.
4. `points_ledger`: Authoritative ledger; students cannot write or manipulate point values directly.
5. `payments`: Scoped to accountant and admin roles for the specific tenant.

---

## 3. Secret Protection & API Key Masking

1. **Client-Side Sanitization**: Flutter Web, Android, iOS, and browser code never receive raw provider API keys.
2. **Super Admin Provider Inspection**: The `GET /api/v1/superadmin/ai-providers` endpoint returns `"api_key_masked": "sk-proj-****************"`, preventing credential exfiltration even by authenticated administrators.
3. **Environment Security**: All sensitive keys (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) are injected via environment variables and Docker secrets.

---

## 4. Video Generation Prohibition Policy

Per the platform architecture:
- Video generation is permanently locked across the backend.
- Any request to `/api/v1/media/video/generate` or `/api/v1/media/video` returns `HTTP 403 Forbidden` with `"code": "FEATURE_DISABLED"`.
- Tested across Student, School Admin, and Super Admin roles; all rejected unconditionally.

---

## 5. Network & Rate Limiting Defense

1. **Sliding-Window Rate Limiting**:
   - `auth_limit`: 5 requests/sec burst 10 at edge Nginx, 20 req/min at FastAPI application layer.
   - `api_limit`: 30 requests/sec burst 50 at edge Nginx.
2. **Audit Logging**: Every authentication event, role change, and administrative action is logged to `audit_logs` with actor ID, IP address, target entity, and timestamp.
