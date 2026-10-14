import { useEffect } from 'react';

export default function useKeyboardAndMediaSession({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onToggleFocusDecor,
  onCloseFocusDecor,
}) {
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      const targetTag = e.target.tagName.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay();
          break;

        case 'KeyM':
          e.preventDefault();
          onToggleMute();
          break;

        case 'KeyF':
          e.preventDefault();
          if (onToggleFocusDecor) onToggleFocusDecor();
          break;

        case 'Escape':
          if (onCloseFocusDecor) onCloseFocusDecor();
          break;

        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;

        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange(Math.min(1, volume + 0.05));
          break;

        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 0.05));
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onTogglePlay,
    onNext,
    onPrev,
    onToggleMute,
    onVolumeChange,
    volume,
    onToggleFocusDecor,
    onCloseFocusDecor,
  ]);

  // Media Session API (Bluetooth earphones, lock screen, Windows media overlays)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'AuraSound Curated',
        artwork: [
          {
            src: currentTrack.cover,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying) onTogglePlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) onTogglePlay();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        onPrev();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        onNext();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          onSeek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('MediaSession API warning:', err);
    }
  }, [currentTrack, isPlaying, onTogglePlay, onNext, onPrev, onSeek]);
}
