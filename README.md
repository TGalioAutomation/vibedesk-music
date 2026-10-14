# 🎵 VibeDesk Music — Minimalist Vinyl Player & Ambient Focus Decor

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-9333ea?style=for-the-badge&logo=anthropic&logoColor=white)](https://modelcontextprotocol.io/)
[![Zero Login](https://img.shields.io/badge/Zero--Login-Frictionless-10b981?style=for-the-badge)](https://github.com/TGalioAutomation/vibedesk-music)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**VibeDesk Music** is a luxury, zero-friction web music player designed for modern desk setups, deep focus sessions, and aesthetic screen decor. Featuring an interactive spinning vinyl turntable, real-time audio spectrum visualizer, a Zen Pomodoro countdown with Solfeggio 528Hz bowl chimes, five immersive dynamic background themes, a stealth administrative gateway, and an AI-driven Model Context Protocol (MCP) server for automated music curation.

> 🌟 **Zero-Login Experience:** No accounts, no subscriptions, no tracking. Open the page and enjoy curated music in under 3 seconds.

---

## 📸 Preview & Highlights

- **Luxury Dark Glassmorphism:** Translucent frosted glass panels, neon accents, and smooth physics.
- **Spinning Vinyl Record:** Realistic turntable with album art center labels, tone arm positioning, and spinning animation synced to audio playback.
- **Real-Time Spectrum Visualizer:** Canvas-rendered Web Audio API frequencies dancing to every beat.
- **Comodoro / Pomodoro Zen Focus Decor:** Fullscreen desktop centerpiece with circular SVG glow ring, Tibetan singing bowl chimes, and auto-hiding interface.
- **5 Dynamic Background Styles:** Album Glow, Rainy Window, Cyberpunk Grid, Deep Nebula, and pure OLED Minimalist.
- **Quick Playlist Drawer:** Seamless slide-out right drawer with instant search and live equalizer without leaving fullscreen mode.
- **Ambient Sound Mixer:** Blend soothing sounds of soft rain, ocean waves, or a cozy cafe fireplace over the current track.
- **Sleep Timer & Fade-Out:** Gentle volume attenuation over the final 15 seconds.
- **Stealth Admin Gateway:** Fully hidden from public view; accessible only via secret route (`/#/secret-vault`) or shortcut (`Ctrl+Alt+A`) with brute-force lockout protection.
- **AI-Powered MCP Server:** Direct bridge for AI assistants (Claude, Cursor, Antigravity) to curate tracks, update album art, and auto-deploy to GitHub.

---

## ✨ Features Deep-Dive

### 1. 🍅 Comodoro / Pomodoro Zen Focus Decor (Fullscreen)
Press **`F`** on your keyboard or click the **"Focus Decor (F)"** button to enter fullscreen desktop decor mode:
- **Artistic Interval Modes:**
  - 🎯 **Deep Focus (25m):** Distraction-free work sprint.
  - ☕ **Short Break (5m):** Relax and recharge.
  - 🌴 **Long Break (15m):** Extended rest period.
- **Circular SVG Neon Ring:** Progress ring smoothly contracts in real-time corresponding to cycle percentage.
- **Solfeggio 528Hz Zen Chime:** Gentle Tibetan singing bowl bell rings automatically when a session ends to alert you without jarring noise.
- **Session Counter:** Records completed Pomodoro cycles throughout the day (`🍅 3 Cycles`).
- **One-Click Switch:** Toggle seamlessly between **Pomodoro Countdown** $\leftrightarrow$ **Real-Time Clock (`HH:MM:SS`)**.
- **Smart Auto-Hide:** Cursor and controls automatically hide after 3.5 seconds of inactivity (`cursor: none`), staying active when menus or the playlist drawer are open.

---

### 2. 🎨 5 Aesthetic Background Styles
Switch themes via the **"Hình Nền / Background"** palette menu in fullscreen mode:
1. ✨ **Album Glow (Default):** Vibrant neon aura cast dynamically from the current song's album art and accent color.
2. 🌧️ **Rainy Window:** Atmospheric night rain streaming down a misty window with blurred city lights.
3. ⚡ **Cyberpunk Grid:** Retro 80s synthwave horizon with moving neon grid lines and purple/pink gradients.
4. 🌌 **Deep Nebula:** Cosmic galaxy clouds with slow, hypnotic radial color shifts.
5. 🖤 **OLED Minimalist:** Pure true-black background to maximize battery life and eliminate distractions on OLED displays.

---

### 3. 📋 Quick Playlist Drawer
Click the **"Chọn Nhạc / Tracks"** button in fullscreen focus mode:
- **Right Slide-Out Drawer:** Browse and change songs without exiting fullscreen mode or interrupting your visual vibe.
- **Instant Search:** Filter songs instantly by title, artist, or genre.
- **Live Equalizer Bar:** Visual pulsing bars show which track is currently playing.
- **Smart Mouse Awakening:** Keeps controls visible while the drawer is open.

---

### 4. ☕ Ambient Sound Mixer & Sleep Timer
- **Ambient Sound Mixer:** Layer natural background noise on top of any music:
  - 🌧️ Soft Rain (*Mưa Rơi Êm Dịu*)
  - 🌊 Ocean Waves (*Sóng Biển Rì Rào*)
  - 🔥 Fireplace & Cafe Ambience (*Lửa Trại & Quán Cafe*)
- **Sleep Timer:** Set timer for 15m, 30m, 45m, 60m, or End-of-Track with an automated 15-second acoustic fade-out.

---

### 5. 🛡️ Stealth Admin Gateway & Security
To keep the public interface clean and secure for general visitors:
- **Zero Public Exposure:** The public UI contains no admin buttons, login triggers, or management links.
- **Deployer Secret Access:**
  - Access via URL: `https://your-domain.com/#/secret-vault` (or `?vault=true`)
  - Or trigger anywhere with deployer shortcut: **`Ctrl + Alt + A`**
  - Closing the modal automatically cleans the URL back to `/` so your secret route is never exposed to onlookers.
- **Brute-Force Lockout Protection:**
  - Protected with a 6-digit PIN (customizable in Studio Settings or via `VITE_ADMIN_PIN` env variable).
  - Entering an incorrect PIN 3 times locks the console for **60 seconds** with an active cooldown timer.
- **Client-Side Media Storage (`IndexedDB`):**
  - Drag and drop `.mp3`, `.wav`, or `.m4a` files directly from your computer. Media blobs are stored securely in browser `IndexedDB`.
  - Export new configuration files as `playlist.json` with a single click.

---

### 6. 🎛️ AI-Powered MCP Server (Model Context Protocol)
Located in `mcp-server/`, this Node.js MCP server connects directly to AI sessions (Claude Desktop, Cursor, Antigravity):
- `vibedesk_list_tracks`: Retrieve the current playlist structure and metadata.
- `vibedesk_add_track`: Add new curated songs with lyrics, genre, and album art.
- `vibedesk_update_track`: Modify titles, covers, and audio sources.
- `vibedesk_delete_track`: Delete tracks by ID.
- `vibedesk_batch_import`: Bulk-import tracks generated by AI.
- `vibedesk_git_sync`: Automatically stage, commit, and push updates to GitHub, triggering instant CI/CD deployment on Vercel!

👉 *For detailed configuration, see [mcp-server/README.md](mcp-server/README.md).*

---

## ⌨️ Global Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`F`** | Toggle Fullscreen Focus Decor Mode |
| **`Space`** | Play / Pause |
| **`M`** | Mute / Unmute Audio |
| **`→` (Right Arrow)** | Skip to Next Track |
| **`←` (Left Arrow)** | Return to Previous Track / Restart Track |
| **`↑` / `↓` (Up / Down)** | Increase / Decrease Volume by 5% |
| **`Ctrl + Alt + A`** | Open Stealth Admin Studio Gateway |
| **`Esc`** | Exit Fullscreen Mode / Close Modals |

---

## 🚀 One-Click Deployment

### Deploy to Vercel (Recommended)
1. Fork or import this repository on [Vercel](https://vercel.com/new).
2. The project includes a pre-configured `vercel.json` with SPA routing rewrites and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Cache-Control`).
3. *(Optional)* Add Environment Variables in Vercel project settings:
   - `VITE_ADMIN_PIN`: Your custom 6-digit admin PIN (default: `123456`).
   - `VITE_ADMIN_SECRET_PATH`: Your secret hash route (default: `#/secret-vault`).
4. Click **Deploy**. Your VibeDesk web player will be live immediately!

### Deploy to Cloudflare Pages or Netlify
- The project includes `public/_redirects` (`/* /index.html 200`) for seamless single-page application routing.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 💻 Local Development Setup

### Prerequisites
- Node.js v18+ (tested on Node LTS v24)
- npm or pnpm

### Quick Start
```bash
# 1. Clone repository
git clone git@github.com:TGalioAutomation/vibedesk-music.git
cd vibedesk-music

# 2. Install dependencies
npm install

# 3. Start local Vite development server
npm run dev

# 4. Build for production
npm run build
```

Open your browser at **`http://localhost:5173/`**:
- Press **`F`** to test Focus Decor Mode.
- Visit **`http://localhost:5173/#/secret-vault`** (or press **`Ctrl+Alt+A`**) to open Admin Studio.

---

## 📦 Project Structure

```text
vibedesk-music/
├── mcp-server/                  # Model Context Protocol server for AI automation
│   ├── index.js                 # Stdio MCP server with track management tools
│   ├── package.json             # @modelcontextprotocol/sdk dependency
│   └── README.md                # AI connection guide (Claude, Cursor, Antigravity)
├── public/                      # Static assets & redirect rules
│   ├── _redirects               # Cloudflare Pages / Netlify SPA rewrites
│   └── music/                   # Sample audio documentation
├── src/
│   ├── components/
│   │   ├── AdminDashboardModal.jsx   # Studio Pro (Upload, Analytics, PIN gate)
│   │   ├── AdminInfoModal.jsx        # Admin quick guide
│   │   ├── AmbientMixerModal.jsx     # Ambient sound mixer
│   │   ├── BottomPlayerBar.jsx       # Floating dark glassmorphism player
│   │   ├── FocusDecorView.jsx        # Fullscreen Pomodoro + 5 BG themes + Drawer
│   │   ├── FullscreenVisualizer.jsx  # Audio spectrum particle visualizer
│   │   ├── Navbar.jsx                # Clean public navigation & category pills
│   │   ├── SleepTimerModal.jsx       # Sleep timer & acoustic fade-out
│   │   ├── TrackCard.jsx             # Grid track cards with active indicators
│   │   ├── VinylPlayer.jsx           # Centerpiece spinning turntable
│   │   └── VisualizerCanvas.jsx      # Canvas audio waveform visualizer
│   ├── data/
│   │   └── playlist.json             # Core curated tracks and categories
│   ├── hooks/
│   │   └── useKeyboardAndMediaSession.js  # Keyboard shortcuts & Media Session API
│   ├── services/
│   │   ├── analytics.js              # Play counts, telemetry & completion stats
│   │   └── storage.js                # IndexedDB persistence for uploaded media
│   ├── App.jsx                       # Main application state & stealth router
│   ├── index.css                     # Tailwind styling & glassmorphism filters
│   └── main.jsx                      # Vite React root
├── package.json
├── vercel.json                  # Vercel SPA rewrites & security headers
├── tailwind.config.js
└── vite.config.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and deploy your own aesthetic focus music hub!
