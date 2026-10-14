# 🎛️ VibeDesk MCP Server (Model Context Protocol)

The **VibeDesk MCP Server** enables any AI assistant (Claude Desktop, Cursor, Antigravity, Cline) to connect directly to the **VibeDesk Music** codebase over standard JSON-RPC (stdio transport).

With this server connected, your AI assistant can autonomously:
- 🎵 **Add new songs** (`vibedesk_add_track`) with verified audio URLs, Unsplash album covers, genres, lyrics, and neon accent colors.
- 🖼️ **Update track metadata & artwork** (`vibedesk_update_track`).
- 🗑️ **Delete tracks** (`vibedesk_delete_track`).
- 📋 **Inspect current playlist** (`vibedesk_list_tracks`).
- 📦 **Batch-import tracks** (`vibedesk_batch_import`).
- 🚀 **Trigger Git Auto-Deploy** (`vibedesk_git_sync`): Stages `src/data/playlist.json`, commits, and pushes to GitHub `main` branch to immediately trigger production CI/CD redeployment on Vercel or Cloudflare Pages.

---

## 🛠️ 1. Setup Instructions

### ⭐ Phương Pháp 1: Kết Nối Trực Tiếp Qua Web (Khuyên Dùng — Không cần Node.js local)

Server MCP đã được triển khai online và hoạt động tại:
`https://music.apexdev.website/mcp/sse`

#### Cho Cursor IDE (`.cursor/mcp.json` hoặc `~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "vibedesk-music": {
      "url": "https://music.apexdev.website/mcp/sse"
    }
  }
}
```

#### Cho Claude Desktop / Cline / Extension khác hỗ trợ Remote HTTP/SSE:
```json
{
  "mcpServers": {
    "vibedesk-music": {
      "type": "sse",
      "url": "https://music.apexdev.website/mcp/sse"
    }
  }
}
```

---

### 💻 Phương Pháp 2: Kết Nối Cục Bộ (Local Stdio)

Dành cho khi phát triển offline trên máy Mac:

```json
{
  "mcpServers": {
    "vibedesk-music": {
      "command": "/opt/homebrew/bin/node",
      "args": [
        "/Users/apexdev/Desktop/Projects/vibedesk-music/mcp-server/index.js",
        "--stdio"
      ]
    }
  }
}
```

---

## 💬 2. Example Natural Language AI Prompts

Once the MCP server is configured in your AI assistant, you can instruct it in natural conversation:

### Example 1: Add a New Track
> *"Hey AI, I found a great lofi track: 'https://cdn.pixabay.com/audio/study-beats.mp3'. Title is 'Midnight Code Stream', artist 'Chroma LoFi', genre 'Deep Focus'. Please add it to VibeDesk with a dark aesthetic cyberpunk cover."*

### Example 2: Update Existing Song
> *"Please inspect the playlist, find 'trk-01', update its album art with a moody rainy city night photo from Unsplash, and refine its lyrics."*

### Example 3: Sync & Deploy to Production
> *"Sync the latest playlist updates and push them to GitHub so Vercel redeploys automatically."*
*(The AI will call `vibedesk_git_sync`, committing and pushing to remote `main` branch).*

---

## 🔒 3. Safety & Architectural Constraints
- The MCP server operates strictly on `src/data/playlist.json` using atomic read/write locks, preventing accidental source code corruption.
- Generated IDs follow the unique alphanumeric scheme `trk-{timestamp}-{random}`.
- All track insertions auto-update the root `updatedAt` metadata field.
