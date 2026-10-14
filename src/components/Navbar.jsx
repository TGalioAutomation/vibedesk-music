import React from 'react';
import {
  Disc3,
  Search,
  Sparkles,
  Heart,
  Info,
  Radio,
  Moon,
  Waves,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  favoritesCount,
  onOpenAdminInfo,
  onOpenAdminDashboard,
  onOpenSleepTimer,
  onOpenAmbientMixer,
  onOpenFocusDecor,
  isTimerActive,
  timerSecondsLeft,
  totalTracks,
}) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Logo & Curator Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/30">
              <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent font-['Space_Grotesk']">
                  AuraSound
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Curated
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>{totalTracks} bài hát do Admin tuyển chọn</span>
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenFocusDecor}
              className="p-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 shadow-md shadow-purple-600/20"
              title="Focus Decor Mode (F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSleepTimer}
              className={`p-2 rounded-xl border text-xs ${
                isTimerActive
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
              title="Hẹn giờ ngủ"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAmbientMixer}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-300"
              title="Hòa âm môi trường"
            >
              <Waves className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdminDashboard}
              className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300"
              title="Admin Studio"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên bài hát, nghệ sĩ hoặc album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-purple-500/60 rounded-xl text-white placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Action Tools for Desktop */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Focus Decor Mode Button */}
          <button
            onClick={onOpenFocusDecor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-pink-400/40 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
            title="Mở màn hình Focus Decor toàn màn hình (Phím tắt: F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Focus Decor (F)</span>
          </button>

          {/* Ambient Sound Mixer */}
          <button
            onClick={onOpenAmbientMixer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 transition-all hover:scale-105 active:scale-95 shadow-md shadow-cyan-950/50"
            title="Hòa âm môi trường (mưa, sóng biển, cafe)"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hòa âm</span>
          </button>

          {/* Sleep Timer */}
          <button
            onClick={onOpenSleepTimer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 border ${
              isTimerActive
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                : 'bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-500/30 shadow-md shadow-indigo-950/50'
            }`}
            title="Hẹn giờ tắt nhạc khi ngủ"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {isTimerActive
                ? `${Math.ceil(timerSecondsLeft / 60)}m`
                : 'Hẹn giờ'}
            </span>
          </button>

          {/* Admin Studio */}
          <button
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/40 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
            title="Bảng điều khiển Admin thêm/xóa bài hát"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Studio</span>
          </button>

          {/* Admin Guide */}
          <button
            onClick={onOpenAdminInfo}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="Hướng dẫn nhanh"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {category}
            </button>
          );
        })}

        <button
          onClick={() => setSelectedCategory('favorites')}
          className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
            selectedCategory === 'favorites'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 border border-pink-400/40'
              : 'bg-white/5 hover:bg-white/10 text-pink-300 border border-white/5'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'fill-current text-pink-400' : ''}`} />
          <span>Yêu thích ({favoritesCount})</span>
        </button>
      </div>
    </header>
  );
}
