import { YouTubeVideo } from '../types/video';
import defaultVideosJson from '../../data/youtube_videos.json';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAdminToken } from './adminAuth';

export const VIDEO_STORAGE_KEY = 'vyron_youtube_videos_v1';
const BROADCAST_CHANNEL_NAME = 'vyron_videos_channel';

// Fallback seed videos
export const DEFAULT_VIDEOS: YouTubeVideo[] = defaultVideosJson as YouTubeVideo[];

/**
 * Extracts standard 11-character YouTube video ID from any link format:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 * - https://www.youtube.com/shorts/XXXXXXXXXXX
 * - https://www.youtube.com/embed/XXXXXXXXXXX
 * - https://m.youtube.com/watch?v=XXXXXXXXXXX
 * - Raw 11-char ID
 */
export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // If already exactly 11 valid characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex match for various URL patterns
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }

  // Try parsing query string directly
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (url.searchParams.has('v')) {
      const v = url.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
  } catch {}

  return trimmed;
}

/**
 * Generates reliable YouTube thumbnail URL with high-definition fallback
 */
export function getYouTubeThumbnail(videoId: string, quality: 'maxres' | 'hq' | 'mq' = 'hq'): string {
  if (!videoId) return '/default-avatar.svg';
  const cleanId = extractYouTubeId(videoId);
  if (!cleanId) return '/default-avatar.svg';
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
}

/**
 * Synchronously loads videos from localStorage or initial default data
 */
export function loadVideosLocal(): YouTubeVideo[] {
  if (typeof window === 'undefined') return DEFAULT_VIDEOS;
  try {
    const saved = localStorage.getItem(VIDEO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local videos cache:', e);
  }
  return DEFAULT_VIDEOS;
}

/**
 * Saves videos to localStorage
 */
export function saveVideosLocal(videos: YouTubeVideo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }
}

/**
 * Subscribes to real-time YouTube video updates across all connected devices and phones.
 * 4-Layer Real-Time Engine:
 * 1. Cloud Firestore onSnapshot WebSocket listener.
 * 2. Server-Sent Events (SSE) /api/live-sync push.
 * 3. Cross-tab BroadcastChannel for zero-latency local tab sync.
 * 4. Window CustomEvent listener.
 */
export function subscribeToVideoUpdates(onUpdate: (videos: YouTubeVideo[]) => void): () => void {
  let isSubscribed = true;

  const handleFreshVideos = (freshVideos: YouTubeVideo[]) => {
    if (!isSubscribed || !Array.isArray(freshVideos)) return;
    saveVideosLocal(freshVideos);
    onUpdate(freshVideos);
  };

  // 1. Initial cached state
  const cached = loadVideosLocal();
  onUpdate(cached);

  // 2. Fetch fresh from backend API
  fetch(`/api/videos?_t=${Date.now()}`, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        handleFreshVideos(data.videos);
      }
    })
    .catch(() => {
      // Offline fallback
    });

  // 3. Cloud Firestore real-time onSnapshot listener (instant push to all phones in <1s)
  let unsubFirestore: (() => void) | null = null;
  try {
    const publicProfileRef = doc(db, 'public_profiles', 'owner');
    unsubFirestore = onSnapshot(publicProfileRef, (snapshot) => {
      if (!isSubscribed) return;
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.youtubeVideos && Array.isArray(data.youtubeVideos) && data.youtubeVideos.length > 0) {
          handleFreshVideos(data.youtubeVideos);
        }
      }
    }, (err) => {
      console.warn('Firestore videos snapshot note:', err);
    });
  } catch (err) {
    console.warn('Firestore video listener error:', err);
  }

  // 4. Server-Sent Events (/api/live-sync)
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
    try {
      eventSource = new EventSource('/api/live-sync');
      eventSource.onmessage = (event) => {
        if (!isSubscribed || !event.data) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'YOUTUBE_VIDEOS_UPDATED' && Array.isArray(parsed.videos)) {
            handleFreshVideos(parsed.videos);
          } else if (parsed.type === 'INIT' && Array.isArray(parsed.videos) && parsed.videos.length > 0) {
            handleFreshVideos(parsed.videos);
          }
        } catch {}
      };
    } catch {}
  }

  // 5. Cross-tab BroadcastChannel
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        if (!isSubscribed || !event.data) return;
        if (event.data.type === 'YOUTUBE_VIDEOS_UPDATED' && Array.isArray(event.data.videos)) {
          handleFreshVideos(event.data.videos);
        }
      };
    } catch {}
  }

  // 6. Window CustomEvent listener
  const handleLocalEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ videos: YouTubeVideo[] }>;
    if (customEvent.detail && Array.isArray(customEvent.detail.videos)) {
      handleFreshVideos(customEvent.detail.videos);
    }
  };
  window.addEventListener('vyron_videos_updated', handleLocalEvent);

  return () => {
    isSubscribed = false;
    if (unsubFirestore) {
      try { unsubFirestore(); } catch {}
    }
    if (eventSource) {
      try { eventSource.close(); } catch {}
    }
    if (broadcastChannel) {
      try { broadcastChannel.close(); } catch {}
    }
    window.removeEventListener('vyron_videos_updated', handleLocalEvent);
  };
}

/**
 * Notifies all local tabs and windows of updated videos list
 */
function broadcastVideosLocally(videos: YouTubeVideo[]) {
  if (typeof window === 'undefined') return;
  saveVideosLocal(videos);
  window.dispatchEvent(new CustomEvent('vyron_videos_updated', { detail: { videos } }));
  try {
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.postMessage({ type: 'YOUTUBE_VIDEOS_UPDATED', videos });
    bc.close();
  } catch {}
}

/**
 * Dual saves to Firestore from client for immediate multi-phone synchronization
 */
async function syncToFirestoreDirect(videos: YouTubeVideo[]) {
  try {
    const publicProfileRef = doc(db, 'public_profiles', 'owner');
    await setDoc(publicProfileRef, {
      youtubeVideos: videos,
      youtubeVideosUpdatedAt: Date.now()
    }, { merge: true });
  } catch (e) {
    console.warn('Direct Firestore video save note:', e);
  }
}

/**
 * Admin: Add New Video
 */
export async function adminAddVideo(
  videoData: Omit<YouTubeVideo, 'id' | 'addedAt'>
): Promise<{ success: boolean; video?: YouTubeVideo; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required' };
  }

  const cleanId = extractYouTubeId(videoData.youtubeId || videoData.youtubeUrl);
  if (!cleanId) {
    return { success: false, error: 'Invalid YouTube link or Video ID' };
  }

  const newVideo: YouTubeVideo = {
    ...videoData,
    id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    youtubeId: cleanId,
    youtubeUrl: videoData.youtubeUrl || `https://www.youtube.com/watch?v=${cleanId}`,
    thumbnailUrl: videoData.thumbnailUrl || getYouTubeThumbnail(cleanId),
    addedAt: Date.now()
  };

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'add', video: newVideo })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to save video on server' };
    }

    const updatedList = data.videos || [newVideo, ...loadVideosLocal()];
    broadcastVideosLocally(updatedList);
    syncToFirestoreDirect(updatedList);

    return { success: true, video: newVideo };
  } catch (err: any) {
    // Fallback: direct firestore + local
    const current = loadVideosLocal();
    const updatedList = [newVideo, ...current];
    broadcastVideosLocally(updatedList);
    syncToFirestoreDirect(updatedList);
    return { success: true, video: newVideo };
  }
}

/**
 * Admin: Update Video Details
 */
export async function adminUpdateVideo(
  video: YouTubeVideo
): Promise<{ success: boolean; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required' };
  }

  const cleanId = extractYouTubeId(video.youtubeId || video.youtubeUrl);
  const updatedVideo: YouTubeVideo = {
    ...video,
    youtubeId: cleanId,
    youtubeUrl: video.youtubeUrl || `https://www.youtube.com/watch?v=${cleanId}`,
    thumbnailUrl: video.thumbnailUrl || getYouTubeThumbnail(cleanId)
  };

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'update', video: updatedVideo })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to update video on server' };
    }

    const current = loadVideosLocal();
    const updatedList = current.map(v => v.id === video.id ? updatedVideo : v);
    broadcastVideosLocally(data.videos || updatedList);
    syncToFirestoreDirect(data.videos || updatedList);

    return { success: true };
  } catch (err: any) {
    const current = loadVideosLocal();
    const updatedList = current.map(v => v.id === video.id ? updatedVideo : v);
    broadcastVideosLocally(updatedList);
    syncToFirestoreDirect(updatedList);
    return { success: true };
  }
}

/**
 * Admin: Delete Video
 */
export async function adminDeleteVideo(
  videoId: string
): Promise<{ success: boolean; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required' };
  }

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'delete', videoId })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to delete video on server' };
    }

    const current = loadVideosLocal();
    const updatedList = current.filter(v => v.id !== videoId);
    broadcastVideosLocally(data.videos || updatedList);
    syncToFirestoreDirect(data.videos || updatedList);

    return { success: true };
  } catch (err: any) {
    const current = loadVideosLocal();
    const updatedList = current.filter(v => v.id !== videoId);
    broadcastVideosLocally(updatedList);
    syncToFirestoreDirect(updatedList);
    return { success: true };
  }
}

/**
 * Admin: Set Featured Video
 */
export async function adminSetFeaturedVideo(
  videoId: string
): Promise<{ success: boolean; error?: string }> {
  const token = getAdminToken();
  if (!token) {
    return { success: false, error: 'Unauthorized: Admin login required' };
  }

  try {
    const res = await fetch('/api/admin/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'set_featured', videoId })
    });

    const data = await res.json();
    const current = loadVideosLocal();
    const updatedList = current.map(v => ({ ...v, isFeatured: v.id === videoId }));
    broadcastVideosLocally(data.videos || updatedList);
    syncToFirestoreDirect(data.videos || updatedList);
    return { success: true };
  } catch (err: any) {
    const current = loadVideosLocal();
    const updatedList = current.map(v => ({ ...v, isFeatured: v.id === videoId }));
    broadcastVideosLocally(updatedList);
    syncToFirestoreDirect(updatedList);
    return { success: true };
  }
}
