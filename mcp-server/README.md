# 🎛️ VibeDesk MCP Server (Model Context Protocol)

Máy chủ **MCP (Model Context Protocol)** dành riêng cho dự án **VibeDesk Music**. 
Cho phép bất kỳ AI Assistant nào (Claude Desktop, Cursor, Antigravity, Gemini, Cline) kết nối trực tiếp vào phiên làm việc để:
- 🎵 **Tự động thêm nhạc mới** (`vibedesk_add_track`) kèm metadata chuẩn (tên, nghệ sĩ, link mp3, ảnh bìa, thể loại, màu neon, lời bài hát).
- 🖼️ **Cập nhật thông tin & ảnh bìa** (`vibedesk_update_track`).
- 🗑️ **Xóa bài hát khỏi playlist** (`vibedesk_delete_track`).
- 📋 **Đọc toàn bộ danh sách nhạc** (`vibedesk_list_tracks`).
- 🚀 **Auto-Deploy Git Push** (`vibedesk_git_sync`): Tự động tạo git commit và đẩy trực tiếp lên GitHub để kích hoạt Vercel/Cloudflare Pages tự động build lại website.

---

## 🛠️ 1. Hướng Dẫn Cấu Hình Kết Nối Vào AI

### A. Dành Cho Claude Desktop
Mở file cấu hình của Claude Desktop tại:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Thêm cấu hình sau vào mục `mcpServers`:

```json
{
  "mcpServers": {
    "vibedesk-music": {
      "command": "node",
      "args": [
        "c:/Users/svphu/Desktop/webapp-nghe-nhac/mcp-server/index.js"
      ]
    }
  }
}
```

---

### B. Dành Cho Cursor IDE
Mở file `.cursor/mcp.json` trong dự án của bạn (hoặc vào `Cursor Settings` -> `Features` -> `MCP`):

```json
{
  "mcpServers": {
    "vibedesk": {
      "command": "node",
      "args": ["c:/Users/svphu/Desktop/webapp-nghe-nhac/mcp-server/index.js"]
    }
  }
}
```

---

### C. Dành Cho Antigravity
Cấu hình trong `mcp_config.json`:

```json
{
  "vibedesk": {
    "command": "node",
    "args": ["c:/Users/svphu/Desktop/webapp-nghe-nhac/mcp-server/index.js"]
  }
}
```

---

## 💬 2. Câu Lệnh Mẫu Để Ra Lệnh Cho AI

Sau khi nối MCP vào session, bạn chỉ cần chat tự nhiên với AI:

### Ví dụ 1: Thêm bài hát mới
> *"AI ơi, tôi có bài hát mới tên là 'Sài Gòn Mưa Đêm', nghệ sĩ 'Lofi Chill Lab', link audio là 'https://cdn.example.com/saigon-rain.mp3', thể loại 'Lofi & Chill'. Hãy thêm vào playlist VibeDesk và chọn một ảnh bìa mưa đêm đẹp mắt."*

### Ví dụ 2: Cập nhật bài hát
> *"AI ơi, đổi ảnh bìa của bài 'trk-01' sang ảnh phong cách anime cyberpunk tím và sửa lời bài hát cho sâu lắng hơn nhé."*

### Ví dụ 3: Đồng bộ và Deploy lên Production
> *"AI ơi, hãy đồng bộ playlist vừa cập nhật và đẩy code lên GitHub để Vercel tự build live."*
*(AI sẽ tự động gọi tool `vibedesk_git_sync` để commit và push lên nhánh `main`)*

---

## 🔒 3. Bảo Mật & Ràng Buộc
- MCP Server chỉ ghi vào file cấu hình chuẩn `src/data/playlist.json`, đảm bảo an toàn tuyệt đối, không ghi đè mã nguồn dự án.
- Luôn kiểm tra định dạng và tự động gán ID bài hát duy nhất `trk-{timestamp}`.
