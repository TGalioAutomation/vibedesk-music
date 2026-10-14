import React from 'react';
import { Play, Pause, Heart, Sparkles, Headphones } from 'lucide-react';
import { getAnalyticsData } from '../services/analytics';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatPlays(plays) {
  if (!plays) return '0';
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}k`;
  return String(plays);
}

export default function TrackCard({
  track,
  isCurrent,
  isPlaying,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) {
  const analytics = getAnalyticsData();
  const trackPlays = analytics[track.id]?.plays || 0;

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
        isCurrent
          ? 'glass-panel border-purple-500/50 shadow-lg shadow-purple-500/10 scale-[1.01]'
          : 'glass-panel-subtle hover:bg-white/[0.08] border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        
        {/* Album Artwork with Play Overlay */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Hover Play/Pause Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              {isCurrent && isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </div>
          </div>

          {/* Equalizer Wave Indicator if current playing */}
          {isCurrent && isPlaying && (
            <div className="absolute bottom-1 right-1 flex items-end gap-0.5 bg-black/70 px-1 py-0.5 rounded">
              <span className="w-1 h-2.5 bg-purple-400 animate-pulse rounded-full"></span>
              <span className="w-1 h-3.5 bg-pink-400 animate-pulse delay-75 rounded-full"></span>
              <span className="w-1 h-2 bg-indigo-400 animate-pulse delay-150 rounded-full"></span>
            </div>
          )}
        </div>

        {/* Track Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold truncate ${
                isCurrent
                  ? 'text-purple-300'
                  : 'text-white group-hover:text-purple-200'
              }`}
            >
              {track.title}
            </h3>
            {track.featured && (
              <span className="shrink-0 p-1 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {track.artist} • <span className="text-slate-500">{track.album}</span>
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
              {track.genre}
            </span>

            {/* Views / Play Count Badge */}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
              <Headphones className="w-2.5 h-2.5" />
              <span>{formatPlays(trackPlays)}</span>
            </span>
          </div>
        </div>

        {/* Right side: Duration & Favorite button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {formatDuration(track.duration)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(track.id);
            }}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'text-pink-400 hover:text-pink-300'
                : 'text-slate-500 hover:text-pink-400 opacity-60 group-hover:opacity-100'
            }`}
            title={isFavorite ? 'Bỏ thích' : 'Yêu thích'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}
