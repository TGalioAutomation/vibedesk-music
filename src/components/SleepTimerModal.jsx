import React from 'react';
import { X, Moon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function SleepTimerModal({
  isOpen,
  onClose,
  timerSecondsLeft,
  timerMode,
  onSetTimer,
  onCancelTimer,
}) {
  if (!isOpen) return null;

  const timerOptions = [
    { label: '15 phút', value: 15 * 60, mode: 'time' },
    { label: '30 phút', value: 30 * 60, mode: 'time' },
    { label: '45 phút', value: 45 * 60, mode: 'time' },
    { label: '60 phút', value: 60 * 60, mode: 'time' },
    { label: 'Hết bài hiện tại', value: null, mode: 'end_of_track' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 sm:p-7 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Hẹn Giờ Tắt Nhạc
            </h3>
            <p className="text-xs text-slate-400">
              Nhạc sẽ tự động dịu dần và dừng phát khi bạn chìm vào giấc ngủ
            </p>
          </div>
        </div>

        {/* Active Timer Countdown Status */}
        {timerMode && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
              <div>
                <p className="text-xs text-purple-300 font-medium">Đang đếm ngược</p>
                <p className="text-xl font-mono font-bold text-white">
                  {timerMode === 'end_of_track'
                    ? 'Dừng khi hết bài'
                    : formatCountdown(timerSecondsLeft)}
                </p>
              </div>
            </div>
            <button
              onClick={onCancelTimer}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-all"
            >
              Hủy hẹn giờ
            </button>
          </div>
        )}

        {/* Timer Selection Options */}
        <div className="space-y-2.5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Chọn thời gian
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {timerOptions.map((opt, idx) => {
              const isSelected =
                (opt.mode === 'end_of_track' && timerMode === 'end_of_track') ||
                (opt.mode === 'time' &&
                  timerMode === 'time' &&
                  Math.abs(timerSecondsLeft - opt.value) < 10);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSetTimer(opt.mode, opt.value);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/60 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Tính năng thông minh sẽ hạ dần âm lượng (Fade-out) trong 15 giây cuối trước khi tắt hẳn để giấc ngủ không bị gián đoạn.
          </span>
        </div>

      </div>
    </div>
  );
}
