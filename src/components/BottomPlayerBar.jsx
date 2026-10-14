import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Maximize2,
} from 'lucide-react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function BottomPlayerBar({
  track,
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
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  isFavorite,
  onToggleFavorite,
  onOpenFocusDecor,
}) {
  if (!track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:px-6 shadow-2xl backdrop-blur-2xl pointer-events-auto">
        
        {/* Top Seekbar slider */}
        <div className="flex items-center gap-2 mb-2 group">
          <span className="text-[11px] text-slate-400 font-mono w-9 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none"
            />
            {/* Custom filled progress bar overlay */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-lg pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] text-slate-400 font-mono w-9">
            {formatTime(duration)}
          </span>
        </div>

        {/* Main Player Row */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Mini Track Information */}
          <div className="flex items-center gap-3 w-1/4 min-w-[120px] sm:min-w-[180px]">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/10">
              <img
                src={track.cover}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                {track.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {track.artist}
              </p>
            </div>
            <button
              onClick={() => onToggleFavorite(track.id)}
              className="hidden sm:block text-slate-400 hover:text-pink-400 transition-colors p-1"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-pink-400' : ''}`} />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-2 rounded-xl transition-all ${
                isShuffle
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Phát ngẫu nhiên"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={onPrev}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Bài trước đó"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Bài kế tiếp"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={onCycleRepeat}
              className={`p-2 rounded-xl transition-all ${
                repeatMode !== 'off'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={
                repeatMode === 'one'
                  ? 'Lặp lại 1 bài'
                  : repeatMode === 'all'
                  ? 'Lặp lại toàn bộ'
                  : 'Tắt lặp lại'
              }
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right: Volume & Focus Decor Button */}
          <div className="flex items-center justify-end gap-2 w-1/4">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="hidden sm:block w-20 lg:w-24">
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

            {/* Focus Decor button in Bottom bar */}
            <button
              onClick={onOpenFocusDecor}
              className="p-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 transition-all ml-1"
              title="Màn hình Focus Decor (Phím F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
