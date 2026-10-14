import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Send,
  Check,
  Copy,
  Music,
  CloudRain,
  Coffee,
  Laptop,
  SunMedium,
  Compass,
  Radio,
  Flame,
  MessageSquareHeart,
} from 'lucide-react';

export default function EmotionFeedbackModal({ isOpen, onClose }) {
  const [selectedMoodId, setSelectedMoodId] = useState('rainy');
  const [customStory, setCustomStory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Lofi & Chill');
  const [selectedInstruments, setSelectedInstruments] = useState(['Piano', 'Tiếng mưa']);
  const [nickname, setNickname] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Preset Moods for AI Music Generation
  const moodPresets = [
    {
      id: 'rainy',
      title: 'Mưa Đêm Hoài Niệm',
      desc: 'Nốt nhạc êm đềm như hạt mưa rơi trên ô cửa sổ, gợi nhớ kỷ niệm xưa.',
      icon: <CloudRain className="w-4 h-4 text-cyan-400" />,
      accent: '#06b6d4',
      promptTag: 'nostalgic rainy night, melancholic, reflective, gentle vinyl crackle',
    },
    {
      id: 'coding',
      title: 'Đêm Muộn Chạy Code',
      desc: 'Nhịp beat lofi lôi cuốn, đưa tâm trí vào trạng thái dòng chảy tập trung sâu.',
      icon: <Laptop className="w-4 h-4 text-purple-400" />,
      accent: '#a855f7',
      promptTag: 'late night programming flow, steady 85 bpm lofi hip hop, deep focus, soothing synth',
    },
    {
      id: 'zen',
      title: 'Tĩnh Lặng Chữa Lành',
      desc: 'Không gian tĩnh tại, tiếng chuông gió hòa cùng thanh âm chữa lành tâm hồn.',
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
      accent: '#10b981',
      promptTag: 'ambient healing meditation, solfeggio 528hz, atmospheric pads, inner peace',
    },
    {
      id: 'sunset',
      title: 'Hoàng Hôn Lãng Đãng',
      desc: 'Khoảnh khắc mặt trời lặn nhuộm tím chân trời, nhẹ nhàng và ấm áp.',
      icon: <SunMedium className="w-4 h-4 text-amber-400" />,
      accent: '#f59e0b',
      promptTag: 'golden hour sunset, warm guitar chords, chillout downtempo, cinematic warmth',
    },
    {
      id: 'cafe',
      title: 'Góc Cafe Sương Sớm',
      desc: 'Hương thơm cà phê ấm nóng buổi sáng, âm thanh thì thầm dễ chịu.',
      icon: <Coffee className="w-4 h-4 text-orange-400" />,
      accent: '#ea580c',
      promptTag: 'cozy morning cafe vibes, acoustic guitar, soft saxophone, relaxing jazz lofi',
    },
    {
      id: 'cyber',
      title: 'Bứt Phá Năng Lượng',
      desc: 'Giai điệu điện tử synthwave bùng nổ, truyền cảm hứng tăng tốc công việc.',
      icon: <Flame className="w-4 h-4 text-pink-400" />,
      accent: '#ec4899',
      promptTag: 'retro synthwave, 80s neon future, energetic 115 bpm, driving bassline',
    },
  ];

  const genresList = [
    'Lofi & Chill',
    'Acoustic Piano',
    'Cyber Synth',
    'Ambient Drone',
    'Jazz Hop',
    'Chillstep',
    'Classical Cello',
  ];

  const instrumentOptions = [
    'Piano',
    'Guitar mộc',
    'Tiếng mưa',
    'Tiếng đĩa than',
    'Saxophone',
    'Synth Pad',
    'Sóng biển',
    'Bass ấm',
  ];

  const currentPreset = moodPresets.find((m) => m.id === selectedMoodId) || moodPresets[0];

  // Live Generated AI Prompt
  const generatedAIPrompt = useMemo(() => {
    const instStr = selectedInstruments.join(', ');
    const storyPart = customStory.trim() ? ` Story: "${customStory.trim()}".` : '';
    return `[Genre: ${selectedGenre}] [Vibe: ${currentPreset.promptTag}] [Instruments: ${instStr}].${storyPart} High fidelity, 320kbps, cinematic audio production, emotional resonance.`;
  }, [currentPreset, selectedGenre, selectedInstruments, customStory]);

  if (!isOpen) return null;

  const toggleInstrument = (inst) => {
    setSelectedInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedAIPrompt).catch(() => {});
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestItem = {
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      moodTitle: currentPreset.title,
      moodId: currentPreset.id,
      accentColor: currentPreset.accent,
      genre: selectedGenre,
      instruments: selectedInstruments,
      story: customStory.trim(),
      nickname: nickname.trim() || 'Người nghe ẩn danh',
      aiPrompt: generatedAIPrompt,
      status: 'new', // 'new' | 'produced'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('vibedesk_emotion_requests') || '[]');
      existing.unshift(requestItem);
      localStorage.setItem('vibedesk_emotion_requests', JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to save emotion request to localStorage:', err);
    }

    // Sync to backend server API so AI MCP & Admin can inspect it globally
    fetch('/api/emotion-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestItem),
    }).catch((err) => {
      console.warn('API emotion sync failed, falling back to local storage:', err);
    });

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCustomStory('');
    setNickname('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/10 p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <span>Gợi Ý Cảm Xúc Nhạc AI</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                AI Driven
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              VibeDesk sáng tạo âm nhạc AI dựa trên chính cảm xúc và tâm trạng của bạn
            </p>
          </div>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Cảm Ơn Bạn Đã Gửi Cảm Xúc!</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Ý tưởng của bạn đã được chuyển tới Admin Studio và bộ lọc AI. Chúng tôi sẽ sản xuất bản nhạc mới mang đúng rung cảm của bạn trong bản cập nhật tới!
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
              >
                Tiếp tục nghe nhạc
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Step 1: Mood Preset Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>1. Chọn Cảm Xúc Chủ Đạo Của Bạn:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {moodPresets.map((m) => {
                  const isSelected = selectedMoodId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMoodId(m.id)}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 shadow-md shadow-purple-600/20'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {m.icon}
                        <h5 className="text-xs font-bold text-white truncate">{m.title}</h5>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Story or Atmosphere */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>2. Chia sẻ thêm câu chuyện / tâm sự (Tùy chọn):</span>
                <span className="text-[10px] text-slate-500">Giúp AI hiểu sâu hơn cảm xúc của bạn</span>
              </label>
              <textarea
                rows={3}
                value={customStory}
                onChange={(e) => setCustomStory(e.target.value)}
                placeholder="Ví dụ: Đêm nay mình phải hoàn thành dự án tốt nghiệp, cần một bài nhạc êm dịu có tiếng mưa tí tách để không bị căng thẳng..."
                className="w-full p-3 text-xs bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all resize-none"
              />
            </div>

            {/* Step 3: Genre & Instruments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Genre */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  3. Thể loại mong muốn:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {genresList.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                        selectedGenre === g
                          ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Elements & Instruments */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">
                  4. Nhạc cụ / Âm thanh yêu thích:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {instrumentOptions.map((inst) => {
                    const isTicked = selectedInstruments.includes(inst);
                    return (
                      <button
                        type="button"
                        key={inst}
                        onClick={() => toggleInstrument(inst)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                          isTicked
                            ? 'bg-pink-600/30 text-pink-200 border-pink-400/50'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {inst} {isTicked ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Real-time AI Prompt Preview */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-purple-400" />
                  AI Music Prompt Preview (Tạo cho Suno / Udio)
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed bg-white/5 p-2 rounded-xl">
                {generatedAIPrompt}
              </p>
            </div>

            {/* Optional Nickname & Submit Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="text"
                placeholder="Tên / Nickname của bạn (tùy chọn)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              <button
                type="submit"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Cảm Xúc Cho Admin & AI</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
