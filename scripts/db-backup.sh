#!/usr/bin/env bash
# ==============================================================================
# scripts/db-backup.sh — Sao lưu cơ sở dữ liệu PostgreSQL cho Pi Decor
# Định dạng: pg_dump Custom format (-Fc) nén cao và hỗ trợ phục hồi linh hoạt
# ==============================================================================
set -euo pipefail

DB_URL="${DATABASE_URL_DIRECT:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "[-] Lỗi: Chưa thiết lập biến môi trường DATABASE_URL_DIRECT hoặc DATABASE_URL." >&2
  exit 1
fi

# Che dấu thông tin nhạy cảm khi hiển thị nhật ký
MASKED_URL=$(echo "$DB_URL" | sed -E 's/:\/\/([^:]+):([^@]+)@/:\/\/\1:***@/')

BACKUP_DIR="${BACKUP_DIR:-backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="${1:-${BACKUP_DIR}/pidecor_${TIMESTAMP}.dump}"

echo "[+] Bắt đầu sao lưu cơ sở dữ liệu..."
echo "    Nguồn: $MASKED_URL"
echo "    Đích : $OUTPUT_FILE"

# Thực thi pg_dump định dạng custom (-Fc)
pg_dump -Fc --no-owner --no-privileges "$DB_URL" -f "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
  FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | awk '{print int($1/1024) " KB"}')
  echo "[✓] Sao lưu thành công! Dung lượng tệp: $FILE_SIZE"
  echo "    Đường dẫn tệp: $OUTPUT_FILE"
else
  echo "[-] Lỗi: Không thể tạo tệp sao lưu." >&2
  exit 1
fi
