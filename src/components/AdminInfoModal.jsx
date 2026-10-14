import React from 'react';
import { X, Check, Code, FolderPlus, Radio, Sparkles } from 'lucide-react';

export default function AdminInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Hướng Dẫn Admin Cập Nhật Bài Hát
            </h3>
            <p className="text-xs text-slate-400">
              Chỉ Admin mới có quyền thêm/bớt nhạc, người nghe chỉ việc thưởng thức
            </p>
          </div>
        </div>

        {/* 3 Step Simple Guide */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white block mb-0.5">
                Chuẩn bị file nhạc (.mp3 / .wav)
              </span>
              Đặt file nhạc vào thư mục <code className="text-purple-300 bg-black/40 px-1.5 py-0.5 rounded">public/music/</code> hoặc lấy trực tiếp URL link âm thanh online.
            </div>
          </div>

          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white block mb-0.5">
                Cập nhật file danh mục dữ liệu
              </span>
              Mở file <code className="text-purple-300 bg-black/40 px-1.5 py-0.5 rounded">src/data/playlist.json</code> và thêm bài hát mới vào danh sách <code className="text-purple-300">tracks</code>.
            </div>
          </div>

          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white block mb-0.5">
                Lưu và phát ngay lập tức!
              </span>
              Webapp tự động cập nhật bài hát mới lên giao diện cho toàn bộ người nghe mà không cần khởi động lại server.
            </div>
          </div>
        </div>

        {/* Code Snippet Example */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Code className="w-3.5 h-3.5 text-purple-400" />
              <span>Mẫu dữ liệu bài hát JSON chuẩn:</span>
            </span>
          </div>
          <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto leading-relaxed">
{`{
  "id": "trk-07",
  "title": "Tên bài hát của bạn",
  "artist": "Tên ca sĩ / Producer",
  "album": "Tên Album",
  "duration": 210,
  "genre": "Lofi & Chill",
  "accentColor": "#a855f7",
  "cover": "https://link-anh-bia.jpg",
  "audioUrl": "/music/ten-bai-hat.mp3",
  "lyrics": "Lời bài hát tùy chọn...",
  "featured": true
}`}
          </pre>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
        >
          Đã hiểu, đóng hướng dẫn
        </button>

      </div>
    </div>
  );
}
