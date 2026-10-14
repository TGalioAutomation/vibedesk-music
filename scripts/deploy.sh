#!/usr/bin/env bash
# ==============================================================================
# Script tự động deploy VibeDesk Music & MCP Web API trên VPS
# Vị trí triển khai: /opt/apps/vibedesk-music
# Port nội bộ: 127.0.0.1:3003 (Nginx Frontend) & 127.0.0.1:3004 (API + MCP Server)
# ==============================================================================
set -euo pipefail

APP_DIR="/opt/apps/vibedesk-music"
CONTAINER_FRONTEND="vibedesk-music"
CONTAINER_API="vibedesk-api"
FRONTEND_PORT="3003"
API_PORT="3004"

echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Bắt đầu quy trình Deploy VibeDesk Music & MCP Web API..."

# 1. Đảm bảo thư mục triển khai và thư mục dữ liệu tồn tại
mkdir -p "${APP_DIR}/dist" "${APP_DIR}/src/data"
cd "${APP_DIR}"

# 2. Khởi động hoặc cập nhật containers qua Docker Compose (build API container nếu có thay đổi)
echo "📦 Đang khởi chạy containers qua Docker Compose..."
docker compose up -d --build --remove-orphans

# 3. Reload Nginx để cập nhật bản build mới và proxy config tức thì
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_FRONTEND}$"; then
  echo "🔄 Đang reload Nginx..."
  docker exec "${CONTAINER_FRONTEND}" nginx -s reload || true
fi

# 4. Kiểm tra Health Check
echo "⏳ Đang kiểm tra trạng thái API & MCP tại http://127.0.0.1:${API_PORT}/api/health..."
MAX_RETRIES=20
RETRY_COUNT=0
API_SUCCESS=0

while [ ${RETRY_COUNT} -lt ${MAX_RETRIES} ]; do
  if curl -sf "http://127.0.0.1:${API_PORT}/api/health" > /dev/null 2>&1; then
    API_SUCCESS=1
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Đang chờ vibedesk-api sẵn sàng... (${RETRY_COUNT}/${MAX_RETRIES})"
  sleep 2
done

if [ ${API_SUCCESS} -ne 1 ]; then
  echo "❌ [$(date '+%Y-%m-%d %H:%M:%S')] Deploy thất bại: vibedesk-api không phản hồi."
  docker logs --tail 50 "${CONTAINER_API}" || true
  exit 1
fi

echo "⏳ Đang kiểm tra trạng thái Frontend tại http://127.0.0.1:${FRONTEND_PORT}/..."
if curl -sf "http://127.0.0.1:${FRONTEND_PORT}/" > /dev/null 2>&1; then
  echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Deploy thành công cả Frontend và MCP Web API!"
  docker ps --filter "name=vibedesk" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  exit 0
else
  echo "❌ [$(date '+%Y-%m-%d %H:%M:%S')] Deploy thất bại: Frontend không phản hồi."
  docker logs --tail 50 "${CONTAINER_FRONTEND}" || true
  exit 1
fi
