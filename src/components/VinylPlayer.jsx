import React, { useState } from 'react';
import { Heart, FileText, Music, Sparkles, Headphones } from 'lucide-react';
import VisualizerCanvas from './VisualizerCanvas';
import { getAnalyticsData } from '../services/analytics';

export default function VinylPlayer({
  track,
  isPlaying,
  onTogglePlay,
  isFavorite,
  onToggleFavorite,
  analyserNode,
}) {
  const [showLyrics, setShowLyrics] = useState(false);

  if (!track) return null;

  const analytics = getAnalyticsData();
  const trackPlays = analytics[track.id]?.plays || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 lg:p-8 border border-white/10 shadow-2xl transition-all duration-500">
      
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-35 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: track.accentColor || '#8b5cf6' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: '#ec4899' }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left side: Animated Vinyl Record & Turntable Tonearm */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            
            {/* Turntable Base Shadow / Glow */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 blur-2xl opacity-40 ${
                isPlaying ? 'scale-105 opacity-60' : 'scale-95 opacity-20'
              }`}
              style={{ backgroundColor: track.accentColor }}
            />

            {/* Vinyl Record */}
            <div
              className={`relative w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-950 p-2 shadow-2xl border-4 border-zinc-800/80 transition-transform ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                boxShadow: '0 0 50px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.9)',
              }}
            >
              {/* Vinyl Grooves concentric rings */}
              <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />

              {/* Vinyl Center Label (Album Art) */}
              <div className="absolute inset-0 m-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-zinc-900 shadow-inner flex items-center justify-center">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                {/* Spindle hole */}
                <div className="absolute w-4 h-4 rounded-full bg-zinc-950 border-2 border-white/30 shadow-md" />
              </div>

              {/* Vinyl Sheen Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Stylus / Tonearm */}
            <div
              className={`absolute -top-3 right-4 w-28 h-28 pointer-events-none transition-transform duration-700 origin-top-right ${
                isPlaying ? 'rotate-12' : '-rotate-12 opacity-60'
              }`}
            >
              <div className="w-1.5 h-20 bg-gradient-to-b from-zinc-400 via-zinc-300 to-zinc-500 rounded-full shadow-lg ml-auto mr-4" />
              <div className="w-4 h-6 bg-zinc-800 border border-zinc-500 rounded-sm ml-auto mr-3 shadow-md" />
            </div>
          </div>
        </div>

        {/* Right side: Track Information & Audio Visualizer & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          
          <div>
            {/* Genre & Metrics Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{track.genre}</span>
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/5 text-slate-300 border border-white/10">
                {track.album}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Admin Curated
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                <span>{trackPlays.toLocaleString()} lượt nghe</span>
              </span>
            </div>

            {/* Track Title & Artist */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] line-clamp-1">
              {track.title}
            </h2>
            <p className="text-base text-purple-300/90 font-medium mt-1">
              {track.artist}
            </p>
          </div>

          {/* Real-time Spectrum Visualizer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Real-time Audio Spectrum</span>
              </span>
              <span className="text-[11px] text-slate-500">Web Audio API • 48 Bands</span>
            </div>
            <VisualizerCanvas
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              accentColor={track.accentColor}
            />
          </div>

          {/* Interactive Action Bar (Play Now, Lyrics toggle, Like) */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onTogglePlay}
              className="flex-1 py-3 px-6 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{isPlaying ? 'Tạm dừng phát' : 'Thưởng thức ngay'}</span>
            </button>

            {track.lyrics && (
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`p-3 rounded-2xl border transition-all ${
                  showLyrics
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Xem lời bài hát"
              >
                <FileText className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(track.id)}
              className={`p-3 rounded-2xl border transition-all ${
                isFavorite
                  ? 'bg-pink-600/20 border-pink-500/50 text-pink-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-pink-400 hover:bg-white/10'
              }`}
              title={isFavorite ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Expandable Lyrics Card */}
          {showLyrics && track.lyrics && (
            <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                Lời bài hát
              </p>
              {track.lyrics}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
