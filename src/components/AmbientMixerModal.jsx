import React from 'react';
import { X, CloudRain, Waves, Coffee, Volume2, Play, Pause } from 'lucide-react';

export default function AmbientMixerModal({
  isOpen,
  onClose,
  ambientSounds,
  onToggleSound,
  onChangeVolume,
}) {
  if (!isOpen) return null;

  const getIcon = (id) => {
    switch (id) {
      case 'rain':
        return <CloudRain className="w-5 h-5" />;
      case 'ocean':
        return <Waves className="w-5 h-5" />;
      case 'cafe':
        return <Coffee className="w-5 h-5" />;
      default:
        return <CloudRain className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/10 p-6 sm:p-7 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Bộ Trộn Âm Thanh Môi Trường
            </h3>
            <p className="text-xs text-slate-400">
              Hòa phối tiếng mưa, tiếng sóng hoặc quán cafe cùng bài nhạc đang nghe
            </p>
          </div>
        </div>

        {/* Ambient Channels List */}
        <div className="space-y-4 mb-6">
          {ambientSounds.map((sound) => {
            return (
              <div
                key={sound.id}
                className={`p-4 rounded-2xl border transition-all ${
                  sound.isPlaying
                    ? 'bg-white/[0.07] border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/[0.03] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        sound.isPlaying
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {getIcon(sound.id)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {sound.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {sound.isPlaying ? 'Đang hòa âm...' : 'Đang tắt'}
                      </p>
                    </div>
                  </div>

                  {/* Play/Pause Channel Button */}
                  <button
                    onClick={() => onToggleSound(sound.id)}
                    className={`p-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 ${
                      sound.isPlaying
                        ? 'bg-cyan-600 text-white border-cyan-400/50 shadow-md shadow-cyan-600/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {sound.isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Tắt</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Bật</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Volume slider for this ambient track */}
                <div className="flex items-center gap-3 px-1">
                  <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={sound.volume}
                    disabled={!sound.isPlaying}
                    onChange={(e) => onChangeVolume(sound.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                    {Math.round(sound.volume * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/30"
        >
          Hoàn tất hòa âm
        </button>

      </div>
    </div>
  );
}
