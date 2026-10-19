#!/usr/bin/env bash
# ==============================================================================
# scripts/ci-local.sh — Trình giả lập chạy kiểm tra CI cục bộ với môi trường sạch
# Mô phỏng chính xác từng job trong .github/workflows/ci.yml bằng `env -i`,
# CHỈ truyền các biến môi trường mà CI khai báo, giúp phát hiện lỗi thiếu biến trước khi push.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "================================================================================"
echo "🚀 BẮT ĐẦU KIỂM TRA CI CỤC BỘ (LOCAL CI RUNNER)"
echo "================================================================================"

# Giữ lại các biến môi trường hệ thống thiết yếu để node, npm, git vận hành
SYS_ENV=(
  PATH="$PATH"
  HOME="${HOME:-$USERPROFILE}"
  USER="${USER:-$USERNAME}"
)

# Bổ sung biến nền tảng Windows nếu có
if [ -n "${SYSTEMROOT:-}" ]; then SYS_ENV+=(SYSTEMROOT="$SYSTEMROOT"); fi
if [ -n "${COMSPEC:-}" ]; then SYS_ENV+=(COMSPEC="$COMSPEC"); fi
if [ -n "${TEMP:-}" ]; then SYS_ENV+=(TEMP="$TEMP"); fi
if [ -n "${TMP:-}" ]; then SYS_ENV+=(TMP="$TMP"); fi
if [ -n "${APPDATA:-}" ]; then SYS_ENV+=(APPDATA="$APPDATA"); fi
if [ -n "${LOCALAPPDATA:-}" ]; then SYS_ENV+=(LOCALAPPDATA="$LOCALAPPDATA"); fi

# ------------------------------------------------------------------------------
# 1. Job: Web Checks (apps/web)
# ------------------------------------------------------------------------------
echo ""
echo "▶ [1/3] Đang chạy Job: Web Checks (apps/web)..."
env -i "${SYS_ENV[@]}" \
  npm run verify:web
echo "✓ [1/3] Web Checks thành công!"

# ------------------------------------------------------------------------------
# 2. Job: API Checks & Database Documentation Freshness (apps/api)
# ------------------------------------------------------------------------------
echo ""
echo "▶ [2/3] Đang chạy Job: API Checks & Docs Freshness (apps/api)..."
LOCAL_PG_URL="${LOCAL_PG_URL:-${DATABASE_URL_DIRECT:-${DATABASE_URL:-postgresql://pidecor:pidecor_dev_only@127.0.0.1:5432/pidecor_test?sslmode=disable}}}"

env -i "${SYS_ENV[@]}" \
  DATABASE_URL="$LOCAL_PG_URL" \
  DATABASE_URL_DIRECT="$LOCAL_PG_URL" \
  DATABASE_URL_TEST="$LOCAL_PG_URL" \
  JWT_SECRET="test_jwt_secret_must_be_at_least_32_characters_long" \
  npm run verify:api

echo "  [*] Đang kiểm tra tính tươi mới của tài liệu cơ sở dữ liệu (Freshness)..."
env -i "${SYS_ENV[@]}" \
  DATABASE_URL="$LOCAL_PG_URL" \
  DATABASE_URL_DIRECT="$LOCAL_PG_URL" \
  npm run docs:db:fresh

if ! git diff --exit-code docs/data/; then
  echo "::error::docs/data/ không khớp với schema cơ sở dữ liệu sinh mới!"
  git diff --stat docs/data/
  exit 1
fi
echo "✓ [2/3] API Checks & Docs Freshness thành công!"

# ------------------------------------------------------------------------------
# 3. Job: Database Backup & Restore Drill
# ------------------------------------------------------------------------------
echo ""
echo "▶ [3/3] Đang chạy Job: Database Backup & Restore Drill..."
if command -v psql >/dev/null 2>&1; then
  env -i "${SYS_ENV[@]}" \
    DATABASE_URL="$LOCAL_PG_URL" \
    DATABASE_URL_DIRECT="$LOCAL_PG_URL" \
    RESTORE_TEST_DB_NAME="pidecor_restore_drill" \
    JWT_SECRET="drill_jwt_secret_minimum_32_chars_long_xxxxx" \
    ADMIN_EMAIL="drill-admin@example.test" \
    ADMIN_PASSWORD="DrillPassword123!" \
    bash scripts/backup-restore-drill.sh
  echo "✓ [3/3] Backup & Restore Drill thành công!"
else
  echo "  [i] Bỏ qua kiểm tra drill vì 'psql' chưa được cài trong PATH của shell hiện tại."
fi

echo ""
echo "================================================================================"
echo "🎉 TOÀN BỘ CÁC JOB CI CỤC BỘ ĐỀU VƯỢT QUA VỚI MÔI TRƯỜNG SẠCH!"
echo "================================================================================"
