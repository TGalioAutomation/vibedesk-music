# 🚀 Hướng Dẫn Triển Khai (Deployment Guide) - VibeDesk Music

Hệ thống được thiết kế theo kiến trúc tối ưu hóa tài nguyên cho VPS Ubuntu, phục vụ qua Docker Nginx Alpine và Caddy Reverse Proxy với chứng chỉ SSL/TLS tự động.

---

## 🏛️ 1. Kiến Trúc Hệ Thống (Architecture)

```
[ Internet / Browser ]
         │ (HTTPS / 443)
         ▼
[ Caddy Reverse Proxy ]
  ├── https://music.apexdev.website
  └── https://vibedesk.apexdev.website
         │ (HTTP / 127.0.0.1:3003)
         ▼
[ Docker: vibedesk-music ] (nginx:alpine)
  ├── Volume: /opt/apps/vibedesk-music/dist
  └── Config: /opt/apps/vibedesk-music/nginx.conf
```

- **Vị trí trên VPS**: `/opt/apps/vibedesk-music/`
- **Cổng nội bộ**: `127.0.0.1:3003`
- **Tên miền hoạt động**:
  - `https://music.apexdev.website`
  - `https://vibedesk.apexdev.website`
- **Bảo mật**: Cổng 22 SSH trên VPS được bảo vệ bởi tường lửa UFW và chỉ mở qua mạng nội bộ **Tailscale** (`100.94.160.6`).

---

## ⚙️ 2. Các Thành Phần Triển Khai Đã Tạo

| File | Chức năng |
|---|---|
| `Dockerfile` | Multi-stage build (Node 20 Alpine -> Nginx Alpine) dùng khi cần build container độc lập. |
| `docker-compose.yml` | Khởi chạy container `vibedesk-music` với `nginx:alpine`, mount thư mục `./dist` và cấu hình `nginx.conf`. |
| `nginx.conf` | Cấu hình Nginx tối ưu cho React SPA (SPA routing fallback, gzip compression, cache 30 ngày cho static assets, security headers). |
| `scripts/deploy.sh` | Script tự động khởi chạy, reload Nginx và kiểm tra healthcheck tại cổng 3003. |
| `.github/workflows/deploy.yml` | GitHub Actions workflow tự động build và upload deploy lên VPS mỗi khi push code lên nhánh `main`. |

---

## 🤖 3. Quy Trình Tự Động Hóa (GitHub Actions CI/CD)

Khi có commit push lên nhánh `main`:
1. **GitHub Runner** (`ubuntu-latest`):
   - Checkout code.
   - Chạy `npm ci && npm run build` (tạo thư mục tĩnh `dist/` siêu nhanh trên server GitHub, không làm hao tốn CPU/RAM của VPS).
2. **Bảo mật kết nối**:
   - Runner kết nối an toàn vào mạng Tailscale Mesh qua action `tailscale/github-action@v3`.
3. **Upload & Deploy**:
   - Tải `dist/`, `docker-compose.yml`, `nginx.conf`, `scripts/` lên `/opt/apps/vibedesk-music/` qua SCP.
   - Kích hoạt `scripts/deploy.sh` qua SSH để container Nginx nạp bản build mới tức thì.
   - Tự động kiểm tra HTTP 200 trước khi hoàn thành job.

---

## 🔑 4. Cấu Hình GitHub Secrets Cần Thiết

Các Secret sau đã được cấu hình tự động vào Repository `TGalioAutomation/vibedesk-music`:
- `SSH_HOST`: `100.94.160.6`
- `SSH_USER`: `root`
- `SSH_PORT`: `22`
- `SSH_PRIVATE_KEY`: Private Key Ed25519 đã xác thực trên VPS.

### ⚠️ Bước duy nhất cần làm để kích hoạt CI/CD:
Do firewall UFW của VPS đóng cổng SSH 22 công cộng và chỉ mở trên Tailscale interface, GitHub Actions cần 1 **Tailscale Auth Key** để tham gia mạng VPN:

1. Đăng nhập vào [Tailscale Admin Console - Settings - Keys](https://login.tailscale.com/admin/settings/keys).
2. Nhấn **Generate auth key**:
   - Chọn **Reusable** (hoặc **Ephemeral**).
   - Tùy chọn gán tag: `tag:ci` (nếu có cấu hình ACL).
3. Thêm key vào GitHub Repository Secrets bằng lệnh terminal:
   ```bash
   gh secret set TAILSCALE_AUTHKEY --body "tskey-auth-xxxxxx" -R TGalioAutomation/vibedesk-music
   ```
   *(Hoặc vào GitHub Repo: **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**).*

Sau khi thêm `TAILSCALE_AUTHKEY`, mọi lần push code lên nhánh `main` sẽ tự động deploy lên VPS trong vòng dưới 30 giây!

---

## 🛠️ 5. Thao Tác Thủ Công Nhanh (Khi Cần)

### Triển khai thủ công từ máy Mac:
```bash
# Build dự án
npm run build

# Đồng bộ file lên VPS
scp -i ~/.ssh/id_ed25519 -r dist nginx.conf docker-compose.yml scripts root@100.94.160.6:/opt/apps/vibedesk-music/

# Chạy deploy trên VPS
ssh -i ~/.ssh/id_ed25519 root@100.94.160.6 "cd /opt/apps/vibedesk-music && ./scripts/deploy.sh"
```

### Xem log container trên VPS:
```bash
ssh -i ~/.ssh/id_ed25519 root@100.94.160.6 "docker logs -f vibedesk-music"
```
