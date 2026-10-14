import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  Clock,
  Sparkles,
  Maximize2,
  Heart,
  RotateCcw,
  Coffee,
  Brain,
  Timer,
  Palette,
  ListMusic,
  Search,
  CloudRain,
  Radio,
  Eye,
  Check,
} from 'lucide-react';
import FullscreenVisualizer from './FullscreenVisualizer';

export default function FocusDecorView({
  isOpen,
  onClose,
  track,
  tracks = [],
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isFavorite,
  onToggleFavorite,
  analyserNode,
}) {
  const [decorMode, setDecorMode] = useState('pomodoro'); // 'pomodoro' | 'vinyl' | 'galaxy'
  const [bgStyle, setBgStyle] = useState('album_glow'); // 'album_glow' | 'rainy' | 'cyber_grid' | 'nebula' | 'oled'
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [clockTime, setClockTime] = useState(new Date());
  const hideTimeoutRef = useRef(null);

  // POMODORO (COMODORO) ENGINE STATE
  const [pomodoroType, setPomodoroType] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [totalCycleSeconds, setTotalCycleSeconds] = useState(25 * 60);
  const [completedCycles, setCompletedCycles] = useState(() => {
    try {
      const saved = localStorage.getItem('aurasound_pomodoro_cycles');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [pomodoroDisplayMode, setPomodoroDisplayMode] = useState('timer'); // 'timer' | 'realtime'

  // Play a gentle Zen harmonic chime bell using Web Audio API synthesis
  const playZenChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq, delay, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      playTone(528, 0, 2.5); // 528Hz Solfeggio frequency
      playTone(792, 0.2, 3.0);
    } catch (e) {
      console.warn('Zen chime audio:', e);
    }
  };

  // Live Digital Clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro Countdown Logic
  useEffect(() => {
    if (!isPomodoroActive) return;

    const timer = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPomodoroActive(false);
          playZenChime();

          if (pomodoroType === 'focus') {
            const nextCount = completedCycles + 1;
            setCompletedCycles(nextCount);
            localStorage.setItem('aurasound_pomodoro_cycles', String(nextCount));
            setPomodoroType('short_break');
            setPomodoroSeconds(5 * 60);
            setTotalCycleSeconds(5 * 60);
          } else {
            setPomodoroType('focus');
            setPomodoroSeconds(25 * 60);
            setTotalCycleSeconds(25 * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPomodoroActive, pomodoroType, completedCycles]);

  const handleSelectPomodoroPreset = (type) => {
    setIsPomodoroActive(false);
    setPomodoroType(type);
    let sec = 25 * 60;
    if (type === 'short_break') sec = 5 * 60;
    if (type === 'long_break') sec = 15 * 60;
    setPomodoroSeconds(sec);
    setTotalCycleSeconds(sec);
  };

  const handleResetPomodoro = () => {
    setIsPomodoroActive(false);
    let sec = 25 * 60;
    if (pomodoroType === 'short_break') sec = 5 * 60;
    if (pomodoroType === 'long_break') sec = 15 * 60;
    setPomodoroSeconds(sec);
  };

  // Auto-hide controls and cursor after 3.5s of mouse inactivity (disabled while Drawer or Menu is open)
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      setIsControlsVisible(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      // Do NOT auto-hide if Playlist Drawer or Style Menu is currently open!
      if (!isPlaylistDrawerOpen && !isStyleMenuOpen) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isOpen, isPlaylistDrawerOpen, isStyleMenuOpen]);

  // Request & Exit Native Browser Fullscreen
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Pomodoro Time display
  const pomoMins = String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0');
  const pomoSecs = String(pomodoroSeconds % 60).padStart(2, '0');

  // SVG Circular Ring calculation
  const ringRadius = 135;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const pomodoroProgressPercent =
    totalCycleSeconds > 0 ? pomodoroSeconds / totalCycleSeconds : 0;
  const strokeDashoffset = ringCircumference * (1 - pomodoroProgressPercent);

  // Clock format string
  const hours = String(clockTime.getHours()).padStart(2, '0');
  const minutes = String(clockTime.getMinutes()).padStart(2, '0');
  const seconds = String(clockTime.getSeconds()).padStart(2, '0');
  const dateFormatted = clockTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Background Styles Catalog
  const bgStylesList = [
    { id: 'album_glow', label: 'Album Glow', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'rainy', label: 'Rainy Window', icon: <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'cyber_grid', label: 'Cyberpunk Grid', icon: <Radio className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'nebula', label: 'Deep Nebula', icon: <Eye className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'oled', label: 'OLED Minimalist', icon: <div className="w-3 h-3 rounded-full bg-zinc-950 border border-white/20" /> },
  ];

  // Filtered tracks for the Drawer
  const filteredDrawerTracks = tracks.filter((t) => {
    const q = (playlistSearchQuery || '').toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.genre || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`fixed inset-0 z-50 bg-black overflow-hidden select-none transition-all duration-700 flex flex-col justify-between ${
        !isControlsVisible && !isPlaylistDrawerOpen ? 'cursor-none' : ''
      }`}
    >
      {/* =========================================================================
          DYNAMIC BACKGROUND STYLES
      ========================================================================= */}

      {/* 1. Style: Album Glow (Default) */}
      {bgStyle === 'album_glow' && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl opacity-25 transition-all duration-1000 pointer-events-none"
            style={{ backgroundImage: `url(${track.cover})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[170px] opacity-30 pointer-events-none transition-colors duration-1000 animate-pulse-slow"
            style={{ backgroundColor: track.accentColor || '#8b5cf6' }}
          />
        </>
      )}

      {/* 2. Style: Rainy Window */}
      {bgStyle === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950">
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-xl opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1600&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-blue-950/50 to-slate-950" />
          {/* Subtle Rain drop lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      )}

      {/* 3. Style: Cyberpunk Synthwave Grid */}
      {bgStyle === 'cyber_grid' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-neutral-950">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-purple-950/40 to-black" />
          {/* Perspective 3D Grid */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(236,72,153,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.3) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
              transform: 'perspective(400px) rotateX(40deg) translateY(20%) scale(1.4)',
              transformOrigin: 'bottom center',
            }}
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-pink-500/20 blur-[120px]" />
        </div>
      )}

      {/* 4. Style: Deep Nebula */}
      {bgStyle === 'nebula' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/60 via-transparent to-indigo-950/60" />
        </div>
      )}

      {/* 5. Style: OLED Minimalist Pitch Black */}
      {bgStyle === 'oled' && (
        <div className="absolute inset-0 bg-black pointer-events-none" />
      )}

      {/* =========================================================================
          TOP FLOATING BAR
      ========================================================================= */}
      <div
        className={`relative z-20 p-5 sm:p-6 flex items-center justify-between transition-all duration-500 ${
          isControlsVisible || isPlaylistDrawerOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        {/* Left: Branding & Track pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-white tracking-wide font-['Space_Grotesk']">
              Focus Decor
            </span>
          </div>

          {/* Quick Playlist Drawer Toggle Button */}
          <button
            onClick={() => setIsPlaylistDrawerOpen(!isPlaylistDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isPlaylistDrawerOpen
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
            }`}
            title="Mở danh sách bài hát nhanh"
          >
            <ListMusic className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Chọn Nhạc ({tracks.length})</span>
          </button>
        </div>

        {/* Center: Decor Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          <button
            onClick={() => setDecorMode('pomodoro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              decorMode === 'pomodoro'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Comodoro</span>
          </button>

          <button
            onClick={() => setDecorMode('vinyl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              decorMode === 'vinyl'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đĩa Than</span>
          </button>

          <button
            onClick={() => setDecorMode('galaxy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              decorMode === 'galaxy'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vũ Trụ Sóng</span>
          </button>
        </div>

        {/* Right: Background Style Selector & Controls */}
        <div className="flex items-center gap-2">
          
          {/* Background Style Selector Menu */}
          <div className="relative">
            <button
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-semibold transition-all shadow-md"
              title="Đổi phong cách hình nền"
            >
              <Palette className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden md:inline">Hình Nền</span>
            </button>

            {/* Dropdown Menu for Styles */}
            {isStyleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass-panel border border-white/10 p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                  Phong Cách Nền
                </p>
                {bgStylesList.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setBgStyle(st.id);
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      bgStyle === st.id
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {st.icon}
                      <span>{st.label}</span>
                    </div>
                    {bgStyle === st.id && <Check className="w-3 h-3 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Bật/Tắt tràn viền màn hình (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
            title="Thoát chế độ Focus (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN DECOR VIEW (Pomodoro / Vinyl / Galaxy)
      ========================================================================= */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        
        {/* MODE 1: COMODORO / POMODORO ZEN FOCUS TIMER */}
        {decorMode === 'pomodoro' && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Sub-mode selector (Pomodoro vs Realtime Clock) */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/5">
              <button
                onClick={() => setPomodoroDisplayMode('timer')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  pomodoroDisplayMode === 'timer'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đồng hồ Pomodoro
              </button>
              <button
                onClick={() => setPomodoroDisplayMode('realtime')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  pomodoroDisplayMode === 'realtime'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Giờ thực tế
              </button>
            </div>

            {pomodoroDisplayMode === 'timer' ? (
              <>
                {/* Preset Selectors: 25m Focus / 5m Break / 15m Long Break */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectPomodoroPreset('focus')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      pomodoroType === 'focus'
                        ? 'bg-purple-600/30 text-purple-200 border-purple-400/60 shadow-lg shadow-purple-600/20'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span>25m Tập Trung</span>
                  </button>

                  <button
                    onClick={() => handleSelectPomodoroPreset('short_break')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      pomodoroType === 'short_break'
                        ? 'bg-cyan-600/30 text-cyan-200 border-cyan-400/60 shadow-lg shadow-cyan-600/20'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                    <span>5m Nghỉ Ngắn</span>
                  </button>

                  <button
                    onClick={() => handleSelectPomodoroPreset('long_break')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      pomodoroType === 'long_break'
                        ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400/60 shadow-lg shadow-emerald-600/20'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>15m Nghỉ Dài</span>
                  </button>
                </div>

                {/* Circular Neon Countdown Ring */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
                  <div
                    className={`absolute inset-4 rounded-full blur-2xl opacity-30 transition-all duration-1000 ${
                      isPomodoroActive ? 'scale-105 opacity-50' : 'scale-95 opacity-20'
                    }`}
                    style={{ backgroundColor: track.accentColor || '#8b5cf6' }}
                  />

                  {/* SVG Progress Ring */}
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle
                      cx="50%"
                      cy="50%"
                      r={ringRadius}
                      className="text-white/5"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r={ringRadius}
                      strokeWidth="8"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="url(#pomodoroGlowGradient)"
                      fill="transparent"
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="pomodoroGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Time Display & Controls */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 pointer-events-auto">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-purple-300">
                      {pomodoroType === 'focus'
                        ? 'Phiên Tập Trung'
                        : pomodoroType === 'short_break'
                        ? 'Nghỉ Ngơi Thư Giãn'
                        : 'Nghỉ Ngơi Dài'}
                    </p>

                    <div className="text-5xl sm:text-6xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      <span>{pomoMins}</span>
                      <span className="animate-pulse text-purple-400 mx-1">:</span>
                      <span>{pomoSecs}</span>
                    </div>

                    {/* Quick Pomodoro Controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
                      >
                        {isPomodoroActive ? 'Tạm Dừng' : 'Bắt Đầu'}
                      </button>

                      <button
                        onClick={handleResetPomodoro}
                        className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Đặt lại phiên"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Session Counter & Quote */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5 font-mono">
                    <span>🍅</span>
                    <span>Đã hoàn thành {completedCycles} phiên hôm nay</span>
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    "Tập trung sâu trong 25 phút. Để âm điệu nâng đỡ năng lượng của bạn."
                  </p>
                </div>
              </>
            ) : (
              /* REALTIME CLOCK VIEW */
              <div className="space-y-4 py-6">
                <p className="text-sm font-semibold tracking-wider text-purple-300 uppercase font-mono">
                  {dateFormatted}
                </p>
                <div className="flex items-center justify-center font-['Space_Grotesk'] font-extrabold tracking-tight text-7xl sm:text-9xl text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]">
                  <span>{hours}</span>
                  <span className="animate-pulse text-purple-400 mx-2">:</span>
                  <span>{minutes}</span>
                  <span className="text-4xl sm:text-6xl text-purple-400 font-normal ml-3 font-mono">
                    {seconds}
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic max-w-md mx-auto">
                  "Hãy để âm điệu dẫn dắt tâm trí bạn vào trạng thái tập trung sâu nhất..."
                </p>
              </div>
            )}

            {/* Floating Minimal Track Pill */}
            <div className="flex items-center gap-3.5 p-2.5 px-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl">
              <img
                src={track.cover}
                alt=""
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="text-left pr-2">
                <p className="text-xs font-semibold text-white truncate max-w-xs">
                  {track.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {track.artist} • <span className="text-purple-300">{track.genre}</span>
                </p>
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: VINYL SANCTUARY */}
        {decorMode === 'vinyl' && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full blur-3xl opacity-50 transition-all duration-1000 ${
                  isPlaying ? 'scale-110 opacity-70' : 'scale-95 opacity-30'
                }`}
                style={{ backgroundColor: track.accentColor }}
              />

              <div
                className={`relative w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-950 p-3 shadow-2xl border-4 border-zinc-800/90 transition-transform ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{
                  boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.95)',
                }}
              >
                <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none" />
                <div className="absolute inset-28 rounded-full border border-white/5 pointer-events-none" />

                <div className="absolute inset-0 m-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900 shadow-2xl flex items-center justify-center">
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute w-5 h-5 rounded-full bg-zinc-950 border-2 border-white/40 shadow-inner" />
                </div>

                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 max-w-lg">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-purple-300">
                {track.genre} • {track.album}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] line-clamp-1">
                {track.title}
              </h2>
              <p className="text-base text-slate-400 font-medium">
                {track.artist}
              </p>
            </div>
          </div>
        )}

        {/* MODE 3: SPECTRUM GALAXY */}
        {decorMode === 'galaxy' && (
          <div className="w-full h-full flex flex-col items-center justify-center relative animate-in fade-in zoom-in-95 duration-500">
            <FullscreenVisualizer
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              accentColor={track.accentColor}
            />

            <div className="relative z-10 text-center space-y-2 p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Audio Spectrum Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                {track.title}
              </h2>
              <p className="text-sm text-purple-300 font-medium">{track.artist}</p>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          BOTTOM FLOATING PLAYER BAR
      ========================================================================= */}
      <div
        className={`relative z-20 p-5 sm:p-6 flex flex-col items-center justify-center space-y-3 transition-all duration-500 ${
          isControlsVisible || isPlaylistDrawerOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-2xl bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:px-6 shadow-2xl space-y-2">
          
          {/* Seekbar */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
              {formatSeconds(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center h-3 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 w-8">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Minimal Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left: Like & Quick Playlist Drawer button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleFavorite(track.id)}
                className="p-2 text-slate-400 hover:text-pink-400 transition-colors"
                title="Yêu thích bài hát"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-pink-400' : ''}`} />
              </button>

              <button
                onClick={() => setIsPlaylistDrawerOpen(!isPlaylistDrawerOpen)}
                className={`p-2 rounded-xl transition-all ${
                  isPlaylistDrawerOpen
                    ? 'text-purple-300 bg-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mở danh sách bài hát"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Playback Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrev}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Bài trước (Mũi tên trái)"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
                title="Phát / Tạm dừng (Space)"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Bài kế tiếp (Mũi tên phải)"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Right: Volume & Mute */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="w-16 hidden sm:block">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          Nhấn phím F để bật/tắt toàn màn hình • Nhấn Esc để đóng
        </p>
      </div>

      {/* =========================================================================
          SLIDE-OUT QUICK PLAYLIST DRAWER (RIGHT PANEL)
      ========================================================================= */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-40 w-80 sm:w-96 glass-panel border-l border-white/10 p-5 shadow-2xl flex flex-col justify-between backdrop-blur-3xl transition-transform duration-500 ease-out ${
          isPlaylistDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ListMusic className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Danh Sách Bài Hát
              </h3>
            </div>
            <button
              onClick={() => setIsPlaylistDrawerOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search inside Drawer */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nhanh bài hát..."
              value={playlistSearchQuery}
              onChange={(e) => setPlaylistSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          {/* Song List in Drawer */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-0">
            {filteredDrawerTracks.map((t) => {
              const originalIdx = tracks.findIndex((item) => item.id === t.id);
              const isCurrent = track?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (onSelectTrack) onSelectTrack(originalIdx);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isCurrent
                      ? 'bg-purple-600/20 border-purple-500/50 shadow-md shadow-purple-600/10'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={t.cover} alt="" className="w-full h-full object-cover" />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="w-1 h-3 bg-purple-400 animate-pulse mx-0.5 rounded-full" />
                        <span className="w-1 h-4 bg-pink-400 animate-pulse delay-75 mx-0.5 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                      {t.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {t.artist}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {formatSeconds(t.duration)}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Drawer Footer Info */}
        <div className="pt-3 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400">
            Chọn bài trực tiếp không cần thoát Fullscreen
          </p>
        </div>
      </div>

    </div>
  );
}
