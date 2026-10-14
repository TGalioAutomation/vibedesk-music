import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Download,
  Sparkles,
  ShieldCheck,
  Music,
  Check,
  AlertCircle,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Headphones,
  CheckCircle2,
  Heart,
  UploadCloud,
  FileAudio,
  Image as ImageIcon,
  KeyRound,
  Sliders,
} from 'lucide-react';
import { saveMediaBlob, deleteMediaBlob } from '../services/storage';
import { computeSystemSummary, resetAnalyticsData } from '../services/analytics';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  tracks,
  onAddTrack,
  onDeleteTrack,
  onToggleFeatured,
  onResetDefaultTracks,
  favorites = [],
}) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'upload' | 'manage' | 'settings'
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Settings: Custom PIN
  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // File Upload State
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Form State for new song
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: 180,
    genre: 'Lofi & Chill',
    accentColor: '#8b5cf6',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    audioUrl: '',
    lyrics: '',
    featured: false,
  });

  const [formSuccess, setFormSuccess] = useState(false);

  // Compute live analytics metrics
  const analyticsSummary = useMemo(() => {
    return computeSystemSummary(tracks, favorites);
  }, [tracks, favorites, isOpen]);

  if (!isOpen) return null;

  const currentSavedPin = localStorage.getItem('aurasound_admin_pin') || '123456';

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pin === currentSavedPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.length !== 6 || isNaN(newPin)) {
      alert('Mã PIN phải bao gồm đúng 6 chữ số!');
      return;
    }
    localStorage.setItem('aurasound_admin_pin', newPin);
    setPinChangeSuccess(true);
    setNewPin('');
    setTimeout(() => setPinChangeSuccess(false), 3000);
  };

  // Handle Drag & Drop / Selection for Audio File
  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setIsProcessingFile(true);

    // Auto-fill title from filename
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Read audio duration using temporary audio element
    const objectUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objectUrl);

    tempAudio.onloadedmetadata = () => {
      const dur = Math.round(tempAudio.duration) || 180;
      setFormData((prev) => ({
        ...prev,
        title: prev.title || cleanTitle,
        duration: dur,
        audioUrl: objectUrl, // Temporary preview URL
      }));
      setIsProcessingFile(false);
    };

    tempAudio.onerror = () => {
      setFormData((prev) => ({
        ...prev,
        title: prev.title || cleanTitle,
        audioUrl: objectUrl,
      }));
      setIsProcessingFile(false);
    };
  };

  // Handle Image File selection
  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      cover: objectUrl,
    }));
  };

  // Form Submit (Save track & persist audio blob to IndexedDB)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) {
      alert('Vui lòng điền tối thiểu Tên bài hát và Nghệ sĩ!');
      return;
    }

    if (!audioFile && !formData.audioUrl) {
      alert('Vui lòng chọn file nhạc từ máy hoặc nhập URL file nhạc!');
      return;
    }

    setIsProcessingFile(true);
    const trackId = `trk-${Date.now()}`;

    try {
      let finalAudioUrl = formData.audioUrl;
      let finalCoverUrl = formData.cover;

      // If user uploaded an audio file, persist blob to IndexedDB
      if (audioFile) {
        const audioKey = `audio_${trackId}`;
        await saveMediaBlob(audioKey, audioFile);
        finalAudioUrl = `idb://${audioKey}`;
      }

      // If user uploaded a cover image, persist blob to IndexedDB
      if (coverFile) {
        const coverKey = `cover_${trackId}`;
        await saveMediaBlob(coverKey, coverFile);
        finalCoverUrl = `idb://${coverKey}`;
      }

      const newTrack = {
        id: trackId,
        ...formData,
        audioUrl: finalAudioUrl,
        cover: finalCoverUrl,
        duration: Number(formData.duration) || 180,
      };

      onAddTrack(newTrack);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);

      // Reset Form
      setAudioFile(null);
      setCoverFile(null);
      setFormData({
        title: '',
        artist: '',
        album: '',
        duration: 180,
        genre: 'Lofi & Chill',
        accentColor: '#8b5cf6',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        audioUrl: '',
        lyrics: '',
        featured: false,
      });
      setActiveTab('manage');
    } catch (err) {
      console.error('Lỗi khi lưu bài hát vào IndexedDB:', err);
      alert('Không thể lưu file âm thanh. Vui lòng thử lại!');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Delete Track (also clean up IndexedDB blobs)
  const handleDelete = async (trackId) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?')) {
      await deleteMediaBlob(`audio_${trackId}`);
      await deleteMediaBlob(`cover_${trackId}`);
      onDeleteTrack(trackId);
    }
  };

  // Export playlist.json
  const handleExportJson = () => {
    const dataToExport = {
      curator: 'Admin SoundLab',
      version: '2.5.0',
      updatedAt: new Date().toISOString().split('T')[0],
      categories: ['All', 'Lofi & Chill', 'Cyber Synth', 'Piano & Acoustic', 'Deep Focus'],
      tracks: tracks,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel border border-white/10 p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-500/30 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              AuraSound Admin Studio Pro
            </h3>
            <p className="text-xs text-slate-400">
              Quản trị toàn diện: Upload nhạc trực tiếp, phân tích chỉ số và quản lý hệ thống
            </p>
          </div>
        </div>

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <form onSubmit={handleVerifyPin} className="max-w-xs mx-auto py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Xác Thực Quản Trị Viên</h4>
              <p className="text-xs text-slate-400 mt-1">
                Nhập mã PIN bí mật của Admin (Mặc định: <code className="text-purple-300 font-mono">123456</code>)
              </p>
            </div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Nhập 6 số..."
              className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/60 focus:outline-none"
            />
            {pinError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Mã PIN không đúng. Vui lòng thử lại!</span>
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/30"
            >
              Mở Khóa Quản Trị
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            
            {/* Studio Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Thống Kê & Chỉ Số</span>
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'upload'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload & Thêm Bài Hát</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Quản Lý Bài Hát ({tracks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cài Đặt Hệ Thống</span>
              </button>
            </div>

            {/* TAB 1: THỐNG KÊ & CHỈ SỐ (ANALYTICS) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                
                {/* 4 Core KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Tổng Lượt Nghe</span>
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {analyticsSummary.totalPlays.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-purple-300">Tất cả bài hát hệ thống</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Thời Gian Phát</span>
                      <Headphones className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {analyticsSummary.totalHours} <span className="text-xs font-normal text-slate-400">giờ</span>
                    </p>
                    <p className="text-[10px] text-cyan-300">Tổng thời gian người nghe</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Tỷ Lệ Hoàn Tất</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {analyticsSummary.averageCompletionRate}%
                    </p>
                    <p className="text-[10px] text-emerald-300">Nghe &gt; 80% bài hát</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span>Tổng Lượt Thích</span>
                      <Heart className="w-4 h-4 text-pink-400 fill-current" />
                    </div>
                    <p className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {favorites.length}
                    </p>
                    <p className="text-[10px] text-pink-300">Được người nghe lưu lại</p>
                  </div>
                </div>

                {/* Top 5 Songs Leaderboard */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Top 5 Bài Hát Thịnh Hành Nhất</span>
                  </h4>

                  <div className="space-y-2.5">
                    {analyticsSummary.topTracks.slice(0, 5).map((track, idx) => {
                      const maxPlays = analyticsSummary.topTracks[0]?.plays || 1;
                      const percent = Math.round((track.plays / maxPlays) * 100);

                      return (
                        <div key={track.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                  idx === 0
                                    ? 'bg-amber-500 text-black'
                                    : idx === 1
                                    ? 'bg-slate-300 text-black'
                                    : idx === 2
                                    ? 'bg-amber-700 text-white'
                                    : 'bg-white/10 text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-white truncate">
                                {track.title}
                              </span>
                              <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
                                • {track.artist}
                              </span>
                            </div>
                            <span className="font-mono text-purple-300 font-semibold shrink-0">
                              {track.plays.toLocaleString()} lượt nghe
                            </span>
                          </div>

                          {/* Metric Progress Bar */}
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Table for all songs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bảng Thống Kê Chi Tiết Từng Bài Hát
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.04] text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Bài hát</th>
                          <th className="py-2.5 px-3">Thể loại</th>
                          <th className="py-2.5 px-3 text-right">Lượt nghe</th>
                          <th className="py-2.5 px-3 text-right">Hoàn tất</th>
                          <th className="py-2.5 px-3 text-right">Tỷ lệ</th>
                          <th className="py-2.5 px-3 text-right">Tổng thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analyticsSummary.trackMetrics.map((track) => (
                          <tr key={track.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-white">{track.title}</p>
                              <p className="text-[11px] text-slate-400">{track.artist}</p>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px]">
                                {track.genre}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-purple-300 font-semibold">
                              {track.plays}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                              {track.completions}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                              {track.completionRate}%
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                              {Math.round(track.totalSeconds / 60)} phút
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: UPLOAD & THÊM BÀI HÁT (DIRECT DRAG & DROP) */}
            {activeTab === 'upload' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Drag and Drop Zone for Audio File */}
                <div className="p-6 rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5 hover:bg-purple-500/10 transition-all text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    {audioFile ? (
                      <div>
                        <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>Đã chọn: {audioFile.name}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Tự động nhận diện độ dài
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Kéo thả file nhạc (.mp3, .wav, .m4a) vào đây hoặc bấm để chọn
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          File sẽ được lưu trữ an toàn trong IndexedDB của trình duyệt
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Tên bài hát *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tên bài hát..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nghệ sĩ / Ca sĩ *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tên ca sĩ..."
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Album</label>
                    <input
                      type="text"
                      placeholder="Tên Album..."
                      value={formData.album}
                      onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Thể loại</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
                    >
                      <option value="Lofi & Chill">Lofi & Chill</option>
                      <option value="Cyber Synth">Cyber Synth</option>
                      <option value="Piano & Acoustic">Piano & Acoustic</option>
                      <option value="Deep Focus">Deep Focus</option>
                    </select>
                  </div>

                  {/* Cover Image Upload & Preview */}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Ảnh bìa Album</label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img src={formData.cover} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Màu ánh sáng chủ đạo (Ambient Glow)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-slate-300">{formData.accentColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Thời lượng (giây)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/60 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Lời bài hát (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      placeholder="Nhập lời bài hát tại đây..."
                      value={formData.lyrics}
                      onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingFile}
                  className="w-full py-3 rounded-2xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isProcessingFile ? 'Đang xử lý file...' : 'Lưu & Phát Ngay'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: QUẢN LÝ BÀI HÁT (LIST & ACTIONS) */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Danh mục có <strong className="text-purple-300">{tracks.length} bài hát</strong> đang phát hành
                  </p>
                  <button
                    onClick={handleExportJson}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất file playlist.json</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.cover}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artist} • <span className="text-purple-300">{track.genre}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleFeatured(track.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            track.featured
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                              : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                          }`}
                          title="Đánh dấu nổi bật"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(track.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Xóa bài hát"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CÀI ĐẶT HỆ THỐNG */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-lg mx-auto py-2">
                
                {/* Change PIN Form */}
                <form onSubmit={handleChangePin} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Đổi Mã PIN Quản Trị</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mã PIN hiện tại đang bảo vệ quyền Admin khi mở Studio
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      required
                      placeholder="Mã PIN mới (6 chữ số)..."
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500/60"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shrink-0"
                    >
                      Cập Nhật PIN
                    </button>
                  </div>
                  {pinChangeSuccess && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đổi mã PIN thành công!</span>
                    </p>
                  )}
                </form>

                {/* Reset Analytics Data */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Khôi phục chỉ số thống kê</h4>
                    <p className="text-[11px] text-slate-400">
                      Đặt lại toàn bộ lượt nghe và thời lượng về dữ liệu mặc định
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có muốn đặt lại toàn bộ chỉ số phân tích?')) {
                        resetAnalyticsData();
                        alert('Đã đặt lại dữ liệu phân tích thành công!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:text-white border border-white/10 shrink-0"
                  >
                    Reset Analytics
                  </button>
                </div>

                {/* Factory Reset Tracks */}
                <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Khôi phục danh mục gốc</h4>
                    <p className="text-[11px] text-rose-400/80">
                      Xóa toàn bộ bài hát đã thêm và đưa về 6 bài hát mẫu ban đầu
                    </p>
                  </div>
                  <button
                    onClick={onResetDefaultTracks}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 shrink-0 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục mẫu</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
