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

### 3. Dành Cho Admin (Admin Studio Pro)
Bấm vào nút **"Admin Studio"** trên thanh menu (Mã PIN mặc định: `123456`):
- **Kéo thả Upload trực tiếp:** Thả file `.mp3`, `.wav`, `.m4a` từ máy tính vào ô upload, lưu trữ trực tiếp vào `IndexedDB` của trình duyệt.
- **Thống Kê Chỉ Số Toàn Diện:** Xem tổng lượt nghe, tổng giờ phát, tỷ lệ hoàn tất (%) và bảng xếp hạng Top 5 bài hát thịnh hành nhất.
- **Quản lý danh sách:** Nút xóa bài hát, nút gắn cờ "Bài hát nổi bật" (Featured).
- **Xuất file `playlist.json`:** Tải file cấu hình mới chỉ với 1 click để lưu trữ cố định.

---

## 🚀 Khởi Chạy Dự Án

### 1. Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Sau đó mở trình duyệt tại: `http://localhost:5173/`

### 2. Đóng gói cho Production
```bash
npm run build
```
