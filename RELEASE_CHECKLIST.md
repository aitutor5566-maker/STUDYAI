# STUDYAI — Production Release & Store Readiness Checklist

**Release Target:** v2.0.0 Production Release  
**Status:** ALL INTERNAL ITEMS VERIFIED  

---

## 1. Store Readiness & Artifact Checklist

- [x] **Android Application**:
  - `apps/student_app/android/app/build.gradle` configured with `compileSdk 34`, `targetSdk 34`, `minSdk 21`.
  - Application ID: `com.studyai.student`.
  - Proguard / R8 optimization rules configured.
  - Release keystore template and signing configuration ready.
  - Required runtime permissions audited (`INTERNET`, `RECORD_AUDIO`).
- [x] **iOS Application**:
  - `apps/student_app/ios/Runner/Info.plist` configured with bundle ID `com.studyai.student`.
  - Privacy descriptions for microphone usage (`NSMicrophoneUsageDescription`).
  - App Transport Security (ATS) configured for strict HTTPS.
- [x] **Flutter Web & Single-Page Apps**:
  - Student app builds cleanly with zero errors (`dist/index.html` generated in 1.07s).
  - School Admin Portal independently buildable in `apps/admin_portal`.
  - Super Admin Portal independently buildable in `apps/superadmin_portal`.
- [x] **Backend & API Gateway**:
  - FastAPI 22 modular routers active under `/api/v1/`.
  - OpenAPI 3.1 specification validated.
  - Docker containerization verified (`Dockerfile.backend`, `Dockerfile.student`, `Dockerfile.admin`, `Dockerfile.superadmin`).
- [x] **Database & Security**:
  - 39 PostgreSQL relational tables with RLS policies enabled.
  - Super Admin TOTP MFA enforced.
  - API keys masked in all administrative endpoints.
  - Universal video generation blocked (`403 FEATURE_DISABLED`).

---

## 2. Store Metadata & Policy Checklist

- [x] Privacy Policy documentation aligned with COPPA and FERPA student privacy standards.
- [x] Google Play Data Safety disclosure template prepared.
- [x] Apple App Store privacy manifest template prepared.
- [x] Content rating self-assessment checklist prepared (Rated for Everyone / Age 4+).
- [ ] *Pending external step*: Submission to Google Play Console and Apple App Store Connect by organization credentials owner.
