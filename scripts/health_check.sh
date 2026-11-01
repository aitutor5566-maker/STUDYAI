#!/usr/bin/env bash
set -euo pipefail

# STUDYAI Production Comprehensive Liveness & Readiness Health Probes
API_URL="${API_URL:-http://127.0.0.1:8000}"
ADMIN_URL="${ADMIN_URL:-http://127.0.0.1:3002}"
SUPERADMIN_URL="${SUPERADMIN_URL:-http://127.0.0.1:3003}"
NODE_URL="${NODE_URL:-http://127.0.0.1:3001}"

echo "================================================================"
echo "🩺 STUDYAI PRODUCTION ECOSYSTEM HEALTH & INTEGRITY CHECK"
echo "================================================================"

check_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="$3"
  
  status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${url}" || echo "DOWN")
  if [ "${status_code}" = "${expected_status}" ]; then
    echo "  ✔ [OK] ${name} -> ${url} (HTTP ${status_code})"
    return 0
  else
    echo "  ✖ [FAIL] ${name} -> ${url} (Expected HTTP ${expected_status}, got ${status_code})"
    return 1
  fi
}

FAILED=0

# 1. FastAPI Root Health
check_endpoint "FastAPI Health" "${API_URL}/api/v1/health" "200" || FAILED=1

# 2. FastAPI OpenAPI Documentation Check
check_endpoint "FastAPI OpenAPI Spec" "${API_URL}/openapi.json" "200" || FAILED=1

# 3. Universal Video Generation Block Verification
video_check=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "${API_URL}/api/v1/media/video" -H "Content-Type: application/json" -d '{"prompt":"test"}' || echo "DOWN")
if [ "${video_check}" = "403" ]; then
  echo "  ✔ [OK] Video Generation Prohibition Security Enforcement (HTTP 403 Forbidden)"
else
  echo "  ✖ [FAIL] Video Generation Prohibition Not Enforcing 403 Forbidden (got HTTP ${video_check})"
  FAILED=1
fi

if [ "${FAILED}" -eq 0 ]; then
  echo "================================================================"
  echo "🎉 ALL MONITORED CORE PRODUCTION SERVICES OPERATIONAL"
  echo "================================================================"
  exit 0
else
  echo "================================================================"
  echo "🚨 ONE OR MORE PRODUCTION HEALTH PROBES FAILED"
  echo "================================================================"
  exit 1
fi
