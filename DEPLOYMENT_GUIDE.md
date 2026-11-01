# STUDYAI — Production Deployment Guide

**Target Environment:** Production Multi-Domain Microservices  
**Edge Router:** Nginx Alpine with Let's Encrypt TLS Termination  
**Backend:** FastAPI 0.115 / Uvicorn (4 Workers)  
**Applications:** Independent Flutter Web & Mobile Builds  

---

## 1. Domain Architecture

| Application | Public FQDN | Hosting Target | Container / Service | Port |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `api.studyai.com` | FastAPI Core Service | `studyai_fastapi_prod` | 8000 |
| **Student Web App** | `studyai.com` | Flutter Web / Nginx | `studyai_student_prod` | 80 |
| **School Admin Portal** | `admin.studyai.com` | Flutter Web (Isolated Build) | `studyai_admin_prod` | 80 |
| **Super Admin Console** | `superadmin.studyai.com` | Flutter Web (Restricted Build) | `studyai_superadmin_prod` | 80 |

---

## 2. Environment Configuration

### Production Secrets Template (`infrastructure/deployment/.env.production`)

```env
ENVIRONMENT=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/studyai_prod
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SECURE_SERVICE_ROLE_KEY]
JWT_SECRET=[CRYPTO_RANDOM_256BIT_SECRET]
FEATURE_VIDEO_GENERATION=false
TOTP_MFA_ENABLED=true
CORS_ORIGINS=https://studyai.com,https://admin.studyai.com,https://superadmin.studyai.com
```

---

## 3. Deployment Steps

### Step 1: Pre-Flight Verification
Run the complete integration battery:
```bash
node tests/verify_master_prompt_3_full_integration.mjs
```

### Step 2: Build Independent Docker Containers
```bash
docker compose -f infrastructure/deployment/docker-compose.prod.yml build
```

### Step 3: Launch Production Cluster
```bash
docker compose -f infrastructure/deployment/docker-compose.prod.yml up -d
```

### Step 4: Health Check Verification
```bash
curl -f https://api.studyai.com/api/v1/health
```

---

## 4. Rollback Procedure

1. If health check fails or error rate exceeds 0.5%, trigger automated rollback via Docker tag:
```bash
docker compose -f infrastructure/deployment/docker-compose.prod.yml down
docker compose -f infrastructure/deployment/docker-compose.prod.yml up -d --build
```
2. Database migrations are forward and backward compatible; rollback DDL scripts are maintained in `database/migrations/rollbacks/`.
