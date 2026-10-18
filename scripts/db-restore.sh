#!/usr/bin/env bash
# ==============================================================================
# scripts/db-restore.sh — Phục hồi cơ sở dữ liệu PostgreSQL cho Pi Decor
# Sử dụng: pg_restore --clean --if-exists --no-owner
# Bảo vệ: Bắt buộc cờ --i-know nếu phát hiện đích là Production
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "[-] Lỗi: Cần chỉ định đường dẫn tệp sao lưu hợp lệ." >&2
  echo "    Sử dụng: ./scripts/db-restore.sh <duong_dan_file.dump> [--i-know]" >&2
  exit 1
fi

TARGET_URL="${TARGET_DATABASE_URL:-${DATABASE_URL_DIRECT:-${DATABASE_URL:-}}}"
if [ -z "$TARGET_URL" ]; then
  echo "[-] Lỗi: Chưa thiết lập biến môi trường TARGET_DATABASE_URL hoặc DATABASE_URL." >&2
  exit 1
fi

I_KNOW_FLAG=false
for arg in "$@"; do
  if [ "$arg" == "--i-know" ]; then
    I_KNOW_FLAG=true
  fi
done

# Che dấu thông tin nhạy cảm khi hiển thị nhật ký
MASKED_TARGET=$(echo "$TARGET_URL" | sed -E 's/:\/\/([^:]+):([^@]+)@/:\/\/\1:***@/')

# Cơ chế bảo vệ chặn ghi đè nhầm môi trường Production
IS_PROD=false
if [[ "$TARGET_URL" =~ (neon\.tech|prod|production) ]] || [ "${NODE_ENV:-}" = "production" ]; then
  IS_PROD=true
fi

if [ "$IS_PROD" = true ] && [ "$I_KNOW_FLAG" = false ]; then
  echo "================================================================================" >&2
  echo "🔴 CẢNH BÁO BẢO VỆ DỮ LIỆU SẢN XUẤT (PRODUCTION RESTORE PROTECTION)" >&2
  echo "================================================================================" >&2
  echo "Đích phục hồi được nhận diện là môi trường PRODUCTION:" >&2
  echo "  $MASKED_TARGET" >&2
  echo "Thao tác này sẽ XÓA TOÀN BỘ dữ liệu hiện có và phục hồi từ bản sao lưu." >&2
  echo "Nếu bạn chắc chắn muốn thực hiện, hãy thêm cờ an toàn: --i-know" >&2
  echo "Ví dụ: ./scripts/db-restore.sh $BACKUP_FILE --i-know" >&2
  echo "================================================================================" >&2
  exit 1
fi

echo "[+] Bắt đầu phục hồi cơ sở dữ liệu..."
echo "    Nguồn tệp: $BACKUP_FILE"
echo "    Đích đến : $MASKED_TARGET"

# Thực thi pg_restore với --clean, --if-exists và --no-owner
pg_restore --clean --if-exists --no-owner --no-privileges -d "$TARGET_URL" "$BACKUP_FILE" || {
  RET_CODE=$?
  # pg_restore trả về 1 nếu có một vài cảnh báo nhỏ không ảnh hưởng (warnings), mã > 1 là lỗi nghiêm trọng
  if [ $RET_CODE -gt 1 ]; then
    echo "[-] Lỗi nghiêm trọng khi phục hồi cơ sở dữ liệu (Exit code: $RET_CODE)." >&2
    exit $RET_CODE
  fi
}

echo "[✓] Phục hồi cơ sở dữ liệu hoàn tất thành công!"
