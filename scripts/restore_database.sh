#!/usr/bin/env bash
set -euo pipefail

# STUDYAI Production Database Safe Restoration Script
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Target backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-studyai_prod}"
DB_USER="${DB_USER:-postgres}"

echo "================================================================="
echo "🚨 DANGER: STUDYAI PRODUCTION DATABASE RESTORE INITIATION"
echo "Target Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo "Source Archive:  ${BACKUP_FILE}"
echo "================================================================="

if [ "${CONFIRM_RESTORE:-no}" != "yes" ]; then
  echo "[ABORTED] Set CONFIRM_RESTORE=yes to execute this destructive operation."
  exit 2
fi

echo "[INFO] Restoring database schema and records..."
if command -v psql >/dev/null 2>&1; then
  gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}"
  echo "[SUCCESS] Database restoration complete."
else
  echo "[ERROR] psql CLI utility is required to apply dump archive."
  exit 3
fi
