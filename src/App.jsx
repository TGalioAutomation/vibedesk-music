import React, { useState, useEffect, useRef, useMemo } from 'react';
import defaultPlaylistData from './data/playlist.json';
import Navbar from './components/Navbar';
import VinylPlayer from './components/VinylPlayer';
import TrackCard from './components/TrackCard';
import BottomPlayerBar from './components/BottomPlayerBar';
import AdminInfoModal from './components/AdminInfoModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import SleepTimerModal from './components/SleepTimerModal';
import AmbientMixerModal from './components/AmbientMixerModal';
import FocusDecorView from './components/FocusDecorView';
import EmotionFeedbackModal from './components/EmotionFeedbackModal';
import useKeyboardAndMediaSession from './hooks/useKeyboardAndMediaSession';
import { getMediaBlobUrl } from './services/storage';
import {
  recordTrackPlay,
  recordTrackTime,
  recordTrackCompletion,
} from './services/analytics';
import { ListMusic, Sparkles, Music2, ShieldCheck } from 'lucide-react';

export default function App() {
  // Load tracks with LocalStorage persistence for Admin additions
  const [tracks, setTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('aurasound_admin_tracks');
      return saved ? JSON.parse(saved) : defaultPlaylistData.tracks || [];
    } catch {
      return defaultPlaylistData.tracks || [];
    }
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('aurasound_volume');
    return saved !== null ? Number(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('aurasound_favorites');
      return saved ? JSON.parse(saved) : ['trk-01', 'trk-02'];
    } catch {
      return [];
    }
  });

  // Modal States
  const [isAdminInfoOpen, setIsAdminInfoOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isAmbientMixerOpen, setIsAmbientMixerOpen] = useState(false);
  const [isFocusDecorOpen, setIsFocusDecorOpen] = useState(false);
  const [isEmotionFeedbackOpen, setIsEmotionFeedbackOpen] = useState(false);

  // Sleep Timer States
  const [timerMode, setTimerMode] = useState(null); // 'time' | 'end_of_track' | null
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);

  // Resolved Blob URL for current track (in case it was uploaded by admin)
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState('');
  const [resolvedCoverUrl, setResolvedCoverUrl] = useState('');

  // Telemetry session state to avoid double counting
  const sessionRecordedRef = useRef({
    playCounted: false,
    completionCounted: false,
    lastSecondTracked: 0,
  });

  // Ambient Mixer States
  const [ambientSounds, setAmbientSounds] = useState([
    {
      id: 'rain',
      name: 'Mưa Rơi Êm Dịu',
      url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73bb2223a8.mp3?filename=rain-and-thunder-nature-sounds-7803.mp3',
      isPlaying: false,
      volume: 0.5,
    },
    {
      id: 'ocean',
      name: 'Sóng Biển Rì Rào',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3501a4e12.mp3?filename=ocean-waves-ambient-noise-10499.mp3',
      isPlaying: false,
      volume: 0.4,
    },
    {
      id: 'cafe',
      name: 'Lửa Trại & Quán Cafe',
      url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_2491be4f4a.mp3?filename=fireplace-sound-7052.mp3',
      isPlaying: false,
      volume: 0.4,
    },
  ]);

  // Audio & Web Audio API references
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isAudioCtxInitRef = useRef(false);

  // Ambient Audio Element References
  const ambientAudioRefs = useRef({});

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Resolve Blob URLs if track was uploaded into IndexedDB
  useEffect(() => {
    let isCancelled = false;

    async function resolveUrls() {
      if (!currentTrack) return;

      // Audio URL resolution
      if (currentTrack.audioUrl?.startsWith('idb://')) {
        const key = currentTrack.audioUrl.replace('idb://', '');
        const blobUrl = await getMediaBlobUrl(key);
        if (!isCancelled) setResolvedAudioUrl(blobUrl || '');
      } else {
        if (!isCancelled) setResolvedAudioUrl(currentTrack.audioUrl || '');
      }

      // Cover URL resolution
      if (currentTrack.cover?.startsWith('idb://')) {
        const key = currentTrack.cover.replace('idb://', '');
        const blobUrl = await getMediaBlobUrl(key);
        if (!isCancelled) setResolvedCoverUrl(blobUrl || currentTrack.cover);
      } else {
        if (!isCancelled) setResolvedCoverUrl(currentTrack.cover || '');
      }
    }

    resolveUrls();

    // Reset session telemetry for new track
    sessionRecordedRef.current = {
      playCounted: false,
      completionCounted: false,
      lastSecondTracked: 0,
    };

    return () => {
      isCancelled = true;
    };
  }, [currentTrack]);

  // Effective current track with resolved URLs
  const activeTrack = useMemo(() => {
    if (!currentTrack) return null;
    return {
      ...currentTrack,
      audioUrl: resolvedAudioUrl || currentTrack.audioUrl,
      cover: resolvedCoverUrl || currentTrack.cover,
    };
  }, [currentTrack, resolvedAudioUrl, resolvedCoverUrl]);

  // Save tracks to LocalStorage whenever updated by Admin
  useEffect(() => {
    localStorage.setItem('vibedesk_admin_tracks', JSON.stringify(tracks));
    localStorage.setItem('aurasound_admin_tracks', JSON.stringify(tracks));
  }, [tracks]);

  // Stealth Admin Route & Secret Shortcut Detector
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const secretPath = (import.meta.env.VITE_ADMIN_SECRET_PATH || '#/secret-vault').toLowerCase();

      if (
        hash === secretPath ||
        hash === '#/secret-vault' ||
        hash === '#/admin-vault' ||
        params.get('vault') === 'true' ||
        params.get('admin') === 'vibedesk'
      ) {
        setIsAdminDashboardOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    // Deployer secret shortcut: Ctrl+Alt+A or Ctrl+Shift+A
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminDashboardOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCloseAdminDashboard = () => {
    setIsAdminDashboardOpen(false);
    if (
      window.location.hash ||
      window.location.search.includes('vault') ||
      window.location.search.includes('admin')
    ) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Initialize Web Audio API on first user interaction
  const initAudioContext = () => {
    if (isAudioCtxInitRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      isAudioCtxInitRef.current = true;
    } catch (e) {
      console.warn('Web Audio API initialized in fallback mode:', e);
    }
  };

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('aurasound_volume', String(volume));
  }, [volume, isMuted]);

  // Sync Favorites with LocalStorage
  useEffect(() => {
    localStorage.setItem('aurasound_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Play / Pause handling
  const handleTogglePlay = () => {
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio playback error:', err));
    }
  };

  // Change Track
  const handleSelectTrack = (index) => {
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => console.error('Play track error:', err));
      }
    }, 60);
  };

  // Next Track
  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      handleSelectTrack(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      handleSelectTrack(nextIndex);
    }
  };

  // Previous Track
  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      handleSelectTrack(prevIndex);
    }
  };

  // Seek
  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (trackId) => {
    setFavorites((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Audio Element Event Handlers & Analytics Telemetry
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curTime = audioRef.current.currentTime;
    setCurrentTime(curTime);

    if (curTime >= 5 && !sessionRecordedRef.current.playCounted && currentTrack) {
      recordTrackPlay(currentTrack.id);
      sessionRecordedRef.current.playCounted = true;
    }

    const floorSec = Math.floor(curTime);
    if (floorSec > sessionRecordedRef.current.lastSecondTracked && currentTrack) {
      const diff = floorSec - sessionRecordedRef.current.lastSecondTracked;
      if (diff > 0 && diff < 5) {
        recordTrackTime(currentTrack.id, diff);
      }
      sessionRecordedRef.current.lastSecondTracked = floorSec;
    }

    const totalDur = audioRef.current.duration || currentTrack?.duration || 0;
    if (
      totalDur > 10 &&
      curTime / totalDur >= 0.8 &&
      !sessionRecordedRef.current.completionCounted &&
      currentTrack
    ) {
      recordTrackCompletion(currentTrack.id);
      sessionRecordedRef.current.completionCounted = true;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTrack?.duration || 0);
    }
  };

  const handleEnded = () => {
    if (currentTrack && !sessionRecordedRef.current.completionCounted) {
      recordTrackCompletion(currentTrack.id);
      sessionRecordedRef.current.completionCounted = true;
    }

    if (timerMode === 'end_of_track') {
      setIsPlaying(false);
      setTimerMode(null);
      return;
    }

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all') {
      handleNextTrack();
    } else {
      if (currentTrackIndex < tracks.length - 1) {
        handleNextTrack();
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Cycle Repeat Mode
  const handleCycleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Sleep Timer Countdown & Fade-out Logic
  useEffect(() => {
    if (timerMode !== 'time' || timerSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerMode(null);
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
          return 0;
        }

        if (prev <= 15 && audioRef.current) {
          const fadeRatio = prev / 15;
          audioRef.current.volume = Math.max(0, volume * fadeRatio);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerMode, timerSecondsLeft, volume]);

  const handleSetSleepTimer = (mode, seconds) => {
    setTimerMode(mode);
    setTimerSecondsLeft(seconds || 0);
  };

  const handleCancelSleepTimer = () => {
    setTimerMode(null);
    setTimerSecondsLeft(0);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  // Ambient Mixer Handlers
  const handleToggleAmbient = (id) => {
    setAmbientSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.isPlaying;
          const el = ambientAudioRefs.current[id];
          if (el) {
            if (nextState) el.play().catch(console.warn);
            else el.pause();
          }
          return { ...s, isPlaying: nextState };
        }
        return s;
      })
    );
  };

  const handleChangeAmbientVolume = (id, newVolume) => {
    setAmbientSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const el = ambientAudioRefs.current[id];
          if (el) el.volume = newVolume;
          return { ...s, volume: newVolume };
        }
        return s;
      })
    );
  };

  // Admin Dashboard Handlers
  const handleAddTrack = (newTrack) => {
    setTracks((prev) => [newTrack, ...prev]);
  };

  const handleDeleteTrack = (trackId) => {
    if (tracks.length <= 1) {
      alert('Danh mục phải giữ lại ít nhất 1 bài hát!');
      return;
    }
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      handleNextTrack();
    }
  };

  const handleToggleFeatured = (trackId) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, featured: !t.featured } : t))
    );
  };

  const handleResetDefaultTracks = () => {
    if (window.confirm('Khôi phục danh sách bài hát về trạng thái mẫu ban đầu?')) {
      setTracks(defaultPlaylistData.tracks);
      localStorage.removeItem('aurasound_admin_tracks');
    }
  };

  // Global Keyboard Shortcuts & Media Session Hook
  useKeyboardAndMediaSession({
    currentTrack: activeTrack,
    isPlaying,
    onTogglePlay: handleTogglePlay,
    onNext: handleNextTrack,
    onPrev: handlePrevTrack,
    onSeek: handleSeek,
    volume,
    onVolumeChange: setVolume,
    isMuted,
    onToggleMute: () => setIsMuted(!isMuted),
    onToggleFocusDecor: () => setIsFocusDecorOpen((prev) => !prev),
    onCloseFocusDecor: () => setIsFocusDecorOpen(false),
  });

  // Filtered tracks based on Category & Search Query
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'favorites') return favorites.includes(track.id);
      return track.genre === selectedCategory;
    });
  }, [tracks, searchQuery, selectedCategory, favorites]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col pb-36">
      
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={activeTrack?.audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Hidden Native Ambient Audio Elements */}
      {ambientSounds.map((sound) => (
        <audio
          key={sound.id}
          ref={(el) => (ambientAudioRefs.current[sound.id] = el)}
          src={sound.url}
          loop
          crossOrigin="anonymous"
        />
      ))}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={defaultPlaylistData.categories || ['All']}
        favoritesCount={favorites.length}
        onOpenAdminInfo={() => setIsAdminInfoOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenAmbientMixer={() => setIsAmbientMixerOpen(true)}
        onOpenFocusDecor={() => setIsFocusDecorOpen(true)}
        onOpenEmotionFeedback={() => setIsEmotionFeedbackOpen(true)}
        isTimerActive={timerMode !== null}
        timerSecondsLeft={timerSecondsLeft}
        totalTracks={tracks.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-6 space-y-8 flex-1">
        
        {/* Featured Centerpiece Vinyl Player */}
        <section>
          <VinylPlayer
            track={activeTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            isFavorite={favorites.includes(activeTrack?.id)}
            onToggleFavorite={handleToggleFavorite}
            analyserNode={analyserRef.current}
          />
        </section>

        {/* Tracklist Showcase Header */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {selectedCategory === 'favorites'
                    ? 'Danh sách bài hát yêu thích'
                    : selectedCategory === 'All'
                    ? 'Toàn bộ danh mục Admin tuyển chọn'
                    : `Thể loại: ${selectedCategory}`}
                </h2>
                <p className="text-xs text-slate-400">
                  Hiển thị {filteredTracks.length} / {tracks.length} bản nhạc
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chất lượng Studio 320kbps</span>
            </div>
          </div>

          {/* Track Grid */}
          {filteredTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredTracks.map((track) => {
                const originalIndex = tracks.findIndex((t) => t.id === track.id);
                const isCurrent = activeTrack?.id === track.id;

                return (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isCurrent={isCurrent}
                    isPlaying={isPlaying}
                    onSelect={() => handleSelectTrack(originalIndex)}
                    isFavorite={favorites.includes(track.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
              <Music2 className="w-12 h-12 text-purple-400/50 mx-auto" />
              <h3 className="text-base font-semibold text-white">
                Không tìm thấy bài hát nào
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Không có bài hát nào khớp với từ khóa tìm kiếm hoặc danh mục đã chọn.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* Floating Bottom Player Bar */}
      <BottomPlayerBar
        track={activeTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        repeatMode={repeatMode}
        onCycleRepeat={handleCycleRepeat}
        isFavorite={favorites.includes(activeTrack?.id)}
        onToggleFavorite={handleToggleFavorite}
        onOpenFocusDecor={() => setIsFocusDecorOpen(true)}
      />

      {/* Admin Quick Guide Modal */}
      <AdminInfoModal
        isOpen={isAdminInfoOpen}
        onClose={() => setIsAdminInfoOpen(false)}
      />

      {/* Admin Studio Pro Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={handleCloseAdminDashboard}
        tracks={tracks}
        onAddTrack={handleAddTrack}
        onDeleteTrack={handleDeleteTrack}
        onToggleFeatured={handleToggleFeatured}
        onResetDefaultTracks={handleResetDefaultTracks}
        favorites={favorites}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        timerSecondsLeft={timerSecondsLeft}
        timerMode={timerMode}
        onSetTimer={handleSetSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
      />

      {/* Ambient Relaxing Sound Mixer Modal */}
      <AmbientMixerModal
        isOpen={isAmbientMixerOpen}
        onClose={() => setIsAmbientMixerOpen(false)}
        ambientSounds={ambientSounds}
        onToggleSound={handleToggleAmbient}
        onChangeVolume={handleChangeAmbientVolume}
      />

      {/* Focus Decor Fullscreen View (Key: F or Button) */}
      <FocusDecorView
        isOpen={isFocusDecorOpen}
        onClose={() => setIsFocusDecorOpen(false)}
        track={activeTrack}
        tracks={tracks}
        onSelectTrack={handleSelectTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isFavorite={favorites.includes(activeTrack?.id)}
        onToggleFavorite={handleToggleFavorite}
        analyserNode={analyserRef.current}
      />

      {/* Emotion Feedback & AI Vibe Request Modal */}
      <EmotionFeedbackModal
        isOpen={isEmotionFeedbackOpen}
        onClose={() => setIsEmotionFeedbackOpen(false)}
      />

    </div>
  );
}
