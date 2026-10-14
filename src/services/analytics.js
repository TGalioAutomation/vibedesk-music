// Telemetry & Analytics Service for AuraSound
const STORAGE_KEY = 'aurasound_analytics';

// Initial baseline metrics for default songs
const DEFAULT_ANALYTICS = {
  'trk-01': { plays: 1420, completions: 1180, seconds: 252000 },
  'trk-02': { plays: 980, completions: 790, seconds: 148500 },
  'trk-03': { plays: 850, completions: 720, seconds: 140400 },
  'trk-04': { plays: 630, completions: 510, seconds: 123400 },
  'trk-05': { plays: 1120, completions: 930, seconds: 165600 },
  'trk-06': { plays: 760, completions: 610, seconds: 124200 },
};

export function getAnalyticsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANALYTICS));
      return { ...DEFAULT_ANALYTICS };
    }
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_ANALYTICS };
  }
}

export function saveAnalyticsData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving analytics data:', err);
  }
}

export function recordTrackPlay(trackId) {
  if (!trackId) return;
  const data = getAnalyticsData();
  if (!data[trackId]) {
    data[trackId] = { plays: 0, completions: 0, seconds: 0 };
  }
  data[trackId].plays = (data[trackId].plays || 0) + 1;
  saveAnalyticsData(data);
}

export function recordTrackTime(trackId, addedSeconds) {
  if (!trackId || !addedSeconds) return;
  const data = getAnalyticsData();
  if (!data[trackId]) {
    data[trackId] = { plays: 0, completions: 0, seconds: 0 };
  }
  data[trackId].seconds = (data[trackId].seconds || 0) + Math.round(addedSeconds);
  saveAnalyticsData(data);
}

export function recordTrackCompletion(trackId) {
  if (!trackId) return;
  const data = getAnalyticsData();
  if (!data[trackId]) {
    data[trackId] = { plays: 0, completions: 0, seconds: 0 };
  }
  data[trackId].completions = (data[trackId].completions || 0) + 1;
  saveAnalyticsData(data);
}

export function resetAnalyticsData() {
  localStorage.removeItem(STORAGE_KEY);
  return getAnalyticsData();
}

export function computeSystemSummary(tracks, favorites = []) {
  const data = getAnalyticsData();

  let totalPlays = 0;
  let totalCompletions = 0;
  let totalSeconds = 0;

  const trackMetrics = tracks.map((track) => {
    const stat = data[track.id] || { plays: 0, completions: 0, seconds: 0 };
    totalPlays += stat.plays;
    totalCompletions += stat.completions;
    totalSeconds += stat.seconds;

    const completionRate =
      stat.plays > 0 ? Math.round((stat.completions / stat.plays) * 100) : 0;

    return {
      ...track,
      plays: stat.plays,
      completions: stat.completions,
      totalSeconds: stat.seconds,
      completionRate,
      isLiked: favorites.includes(track.id),
    };
  });

  // Sort descending by plays to find Top tracks
  const topTracks = [...trackMetrics].sort((a, b) => b.plays - a.plays);

  const averageCompletionRate =
    totalPlays > 0 ? Math.round((totalCompletions / totalPlays) * 100) : 0;

  const totalHours = (totalSeconds / 3600).toFixed(1);

  return {
    totalPlays,
    totalCompletions,
    totalSeconds,
    totalHours,
    averageCompletionRate,
    topTracks,
    trackMetrics,
  };
}
