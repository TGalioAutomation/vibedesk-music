#!/usr/bin/env bash
# ==============================================================================
# Script tự động deploy VibeDesk Music trên VPS
# Vị trí triển khai: /opt/apps/vibedesk-music
# Port nội bộ: 127.0.0.1:3003
# ==============================================================================
set -euo pipefail

APP_DIR="/opt/apps/vibedesk-music"
CONTAINER_NAME="vibedesk-music"
LOCAL_PORT="3003"

echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Bắt đầu quy trình Deploy VibeDesk Music..."

# 1. Đảm bảo thư mục triển khai và dist tồn tại
mkdir -p "${APP_DIR}/dist"
cd "${APP_DIR}"

# 2. Khởi động hoặc cập nhật container
echo "📦 Đang khởi chạy container qua Docker Compose..."
docker compose up -d --remove-orphans

# 3. Reload cấu hình nginx nếu container đã chạy trước đó để nhận asset mới tức thì
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "🔄 Đang reload Nginx để nạp bản build mới..."
  docker exec "${CONTAINER_NAME}" nginx -s reload || true
fi

# 4. Kiểm tra Health Check
echo "⏳ Đang kiểm tra trạng thái dịch vụ tại http://127.0.0.1:${LOCAL_PORT}..."
MAX_RETRIES=15
RETRY_COUNT=0
SUCCESS=0

while [ ${RETRY_COUNT} -lt ${MAX_RETRIES} ]; do
  if curl -sf "http://127.0.0.1:${LOCAL_PORT}/" > /dev/null 2>&1; then
    SUCCESS=1
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Đang chờ container sẵn sàng... (${RETRY_COUNT}/${MAX_RETRIES})"
  sleep 2
done

if [ ${SUCCESS} -eq 1 ]; then
  echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Deploy thành công!"
  echo "🌐 Dịch vụ '${CONTAINER_NAME}' đang chạy ổn định tại http://127.0.0.1:${LOCAL_PORT}."
  docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  exit 0
else
  echo "❌ [$(date '+%Y-%m-%d %H:%M:%S')] Deploy thất bại: Dịch vụ không phản hồi sau ${MAX_RETRIES} lần thử."
  docker logs --tail 50 "${CONTAINER_NAME}" || true
  exit 1
fi
