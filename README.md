# 🎵 VibeDesk Music — Minimalist Vinyl Player & Ambient Focus Decor (Zero-Login)

Giao diện nghe nhạc đỉnh cao phong cách **Luxury Dark Glassmorphism** kết hợp **Đĩa than Vinyl xoay**, **Real-time Audio Spectrum Visualizer**, chế độ **Comodoro / Pomodoro Focus Decor Fullscreen** và bộ công cụ **Admin Studio Pro**. Người nghe không cần tạo tài khoản hay đăng nhập, truy cập là thưởng thức ngay lập tức!

---

## ✨ Tính Năng Nổi Bật

### 1. 🍅 Comodoro / Pomodoro Zen Focus Decor (Toàn Màn Hình Trang Trí)
Bấm nút **"Focus Decor (F)"** hoặc ấn phím **`F`** trên bàn phím:
- **Đồng hồ Comodoro / Pomodoro nghệ thuật:**
  - 🎯 **25m Tập trung sâu (Deep Focus)**
  - ☕ **5m Nghỉ ngắn (Short Break)**
  - 🌴 **15m Nghỉ dài (Long Break)**
- **5 Phong Cách Hình Nền Nghệ Thuật (Background Styles):** Bấm nút **"Hình Nền"** ở góc phải trên:
  - ✨ **Album Glow (Mặc định):** Ánh sáng neon hào quang tỏa từ bìa đĩa bài hát đang phát.
  - 🌧️ **Rainy Window:** Kính đọng hạt mưa và ánh đèn thành phố mờ ảo, cảm giác lãng mạn.
  - ⚡ **Cyberpunk Grid:** Lưới viễn tưởng Synthwave phong cách retro 80s với chân trời hoàng hôn.
  - 🌌 **Deep Nebula:** Tinh vân vũ trụ sâu thẳm chuyển màu huyền bí.
  - 🖤 **OLED Minimalist:** Nền đen tuyệt đối tiết kiệm pin, cực kỳ sắc nét trên màn hình OLED.
- **Drawer Danh Sách Nhạc Nhanh (Quick Playlist Drawer):**
  - Bấm nút **"Chọn Nhạc"** (`ListMusic`) trên thanh điều khiển Focus:
  - Khay trượt tinh tế mở từ cạnh phải màn hình với thanh tìm kiếm bài hát tức thì.
  - Chọn bài nghe trực tiếp mà **không cần thoát** khỏi chế độ Fullscreen Decor.
  - Hiệu ứng sóng nhạc nhảy theo nhịp trên bài hát đang phát.
- **Vòng tròn tiến trình SVG Neon (Circular Progress Ring):** Vòng ánh sáng co lại mượt mà theo thời gian thực tương ứng với % thời gian còn lại.
- **Chuông thiền Zen Chime:** Tự động phát âm thanh chuông bát tây tạng tần số sóng Solfeggio 528Hz nhẹ nhàng khi hết phiên để nhắc bạn nghỉ ngơi.
- **Bộ đếm phiên làm việc:** Ghi nhớ số phiên Pomodoro đã hoàn thành hôm nay (`🍅 3 Phiên`).
- **Chuyển đổi linh hoạt:** 1-click chuyển đổi giữa **Đồng hồ đếm ngược Pomodoro** $\leftrightarrow$ **Đồng hồ thời gian thực (`HH:MM:SS`)**.
- **Cơ chế Auto-Hide:** Tự động ẩn thanh công cụ và con trỏ chuột (`cursor: none`) khi không chạm sau 3.5 giây để giữ trọn vẻ đẹp trang trí trên bàn làm việc (tự động giữ hiển thị khi đang mở Drawer hoặc Menu hình nền).

---

### 2. Dành Cho Người Nghe
- **Zero-Friction / Không Cần Login:** Truy cập là phát nhạc ngay trong 3 giây.
- **Ambient Sound Mixer (Hòa âm thư giãn):** Nút **"Hòa âm"** kết hợp thêm tiếng mưa rơi (Rain), tiếng sóng biển (Ocean Waves), hoặc tiếng lửa trại quán cafe (Cafe Ambient) hòa cùng bài nhạc đang phát.
- **Sleep Timer (Hẹn giờ tắt nhạc):** Tùy chọn hẹn giờ 15p, 30p, 45p, 60p hoặc Hết bài hát, tự động giảm dần âm lượng (Fade-out) trong 15s cuối.
- **Phím Tắt Bàn Phím Toàn Cục:**
  - `F`: Bật / Tắt Focus Decor toàn màn hình.
  - `Space`: Phát / Tạm dừng.
  - `M`: Tắt / Bật tiếng.
  - `Mũi tên Phải / Trái`: Chuyển bài kế tiếp / Quay lại bài trước.
  - `Mũi tên Lên / Xuống`: Tăng / Giảm 5% âm lượng.
- **Media Session API:** Hiển thị bài hát, bìa album và điều khiển phát nhạc trên màn hình khóa điện thoại, thông báo Windows và tai nghe Bluetooth.
- **Cá Nhân Hóa Cục Bộ:** Lưu danh sách bài hát yêu thích (Favorites) và mức âm lượng vào `LocalStorage`.

---

### 3. 🛡️ Cổng Quản Trị Viên Ẩn (Stealth Admin Gateway & Security)
Để giữ giao diện công khai tinh tế, sạch sẽ và tối mật:
- **Ẩn 100% trên giao diện:** Người nghe bình thường tuyệt đối không thấy bất kỳ nút hoặc đường dẫn Admin nào.
- **Đường dẫn bí mật dành cho người Deploy:**
  - Truy cập URL bí mật: `https://your-domain.com/#/secret-vault` (hoặc `http://localhost:5173/#/secret-vault`).
  - Hoặc dùng tham số query: `https://your-domain.com/?vault=true`
  - Hoặc nhấn tổ hợp phím tắt bí mật của Deployer: **`Ctrl + Alt + A`**
- **Cơ Chế Bảo Mật & Chống Dò Mã (Brute-force Lockout):**
  - Xác thực bằng mã PIN quản trị viên (có thể đổi trực tiếp trong mục Cài đặt Studio hoặc qua biến môi trường `VITE_ADMIN_PIN`).
  - Tự động khóa bảng điều khiển 60 giây nếu nhập sai 3 lần liên tiếp.
  - Tự động xóa sạch URL bí mật trên thanh địa chỉ trình duyệt khi đóng bảng điều khiển để tránh bị lộ.
- **Tính năng trong Admin Studio:**
  - Kéo thả upload nhạc trực tiếp vào `IndexedDB`.
  - Bảng thống kê chỉ số: Lượt nghe, thời lượng phát, tỷ lệ hoàn thành, Top bài hát.
  - Xuất file cấu hình `playlist.json`.

---

### 4. 🎛️ AI Model Context Protocol (MCP Server)
Dự án đi kèm máy chủ MCP tại thư mục `mcp-server/` cho phép kết nối trực tiếp vào AI session (Claude Desktop, Cursor, Antigravity) để:
- Tự động ra lệnh cho AI tìm kiếm, chọn lọc nhạc và thêm vào `playlist.json`.
- Tự động cập nhật ảnh bìa Unsplash và lời bài hát.
- Tự động chạy tool `vibedesk_git_sync` để commit và push lên GitHub, kích hoạt Vercel tự build live!
👉 *Xem chi tiết cài đặt tại [mcp-server/README.md](file:///c:/Users/svphu/Desktop/webapp-nghe-nhac/mcp-server/README.md).*

---

## 🚀 Triển Khai Lên Production (Deploy Guides)

### Cách 1: Triển khai lên Vercel (Khuyên dùng — 1 Click)
1. Truy cập [Vercel](https://vercel.com/) và liên kết kho mã nguồn `TGalioAutomation/vibedesk-music`.
2. Dự án đã cấu hình sẵn file `vercel.json` (hỗ trợ SPA Rewrites, Cache Control và Security Headers).
3. (Tùy chọn) Thêm biến môi trường trong Vercel Settings:
   - `VITE_ADMIN_PIN`: Mã PIN 6 số bí mật của bạn.
   - `VITE_ADMIN_SECRET_PATH`: Đường dẫn bí mật (mặc định: `#/secret-vault`).
4. Bấm **Deploy** — Website sẽ hoạt động tức thì với tên miền miễn phí `xxx.vercel.app`!

### Cách 2: Triển khai lên Cloudflare Pages / Netlify
- Đã có sẵn file `public/_redirects` với cấu hình `/* /index.html 200`.
- Build command: `npm run build`
- Output directory: `dist`

---

## 💻 Khởi Chạy Cục Bộ (Local Development)

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Đóng gói sản phẩm
npm run build
```
Mở trình duyệt tại: `http://localhost:5173/` (Nhấn phím `F` để vào Focus Decor, truy cập `/#/secret-vault` để mở Admin).
