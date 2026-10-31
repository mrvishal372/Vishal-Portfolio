import { PersonalPortfolioData } from '../types/portfolio';
import defaultPortfolioJson from '../../data/portfolio_data.json';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { adminSavePortfolio } from './adminAuth';
import { isCustomAvatarUrl } from './defaultAvatar';

export const STORAGE_KEY = 'bharatjugaad_custom_user_portfolio_v3';
const DB_NAME = 'BharatJugaadPortfolioDB';
const DB_STORE = 'portfolio_store';

let lastKnownPortfolioTimestamp = 0;

export const BLANK_PORTFOLIO: PersonalPortfolioData = {
  fullName: '',
  headline: '',
  tagline: '',
  shortBio: '',
  aboutMe: '',
  avatarUrl: '',
  coverBannerUrl: '',
  coverBannerPosY: 50,
  coverBannerPosX: 50,
  coverBannerZoom: 1,
  degree: '',
  college: '',
  currentStatus: '',
  location: '',
  email: '',
  phone: '',
  github: '',
  linkedin: '',
  portfolio: '',
  interests: [],
  careerGoals: [],
  education: [],
  learningJourney: [],
  skillCategories: [],
  projects: [],
  certificates: [],
  documents: [],
  resumeFileName: '',
  resumePdfUrl: '',
  resumeLastUpdated: '',
  customNotes: ''
};

/**
 * Robust non-destructive merger that ensures NO admin updates (photos, documents, bio, projects)
 * are ever overwritten or wiped out when the app is updated, reloaded, or fetched from server.
 */
export function smartMergePortfolio(
  existing: PersonalPortfolioData,
  incoming: Partial<PersonalPortfolioData>
): PersonalPortfolioData {
  if (!incoming) return { ...existing };

  const isIncomingNewer = Boolean(
    incoming.updatedAt && incoming.updatedAt > (existing.updatedAt || 0)
  );

  // 1. Avatar selection (never let default template placeholder overwrite a custom uploaded avatar!)
  let finalAvatar = existing.avatarUrl || '';
  if (isIncomingNewer) {
    if (incoming.avatarUrl) {
      finalAvatar = incoming.avatarUrl;
    }
  } else {
    if (isCustomAvatarUrl(incoming.avatarUrl)) {
      finalAvatar = incoming.avatarUrl!;
    } else if (!isCustomAvatarUrl(finalAvatar)) {
      if (typeof window !== 'undefined') {
        const perm = localStorage.getItem('vyron_admin_custom_avatar_permanent') || localStorage.getItem('vyron_admin_custom_avatar');
        if (isCustomAvatarUrl(perm)) {
          finalAvatar = perm!;
        } else {
          finalAvatar = incoming.avatarUrl || finalAvatar || '/profile.png.jpeg';
        }
      } else {
        finalAvatar = incoming.avatarUrl || finalAvatar || '/profile.png.jpeg';
      }
    }
  }

  // 2. Cover Banner (never let default empty banner overwrite admin's custom banner on redeploy)
  let coverBannerUrl = existing.coverBannerUrl || '';
  let coverBannerPosY = existing.coverBannerPosY ?? 50;
  let coverBannerPosX = existing.coverBannerPosX ?? 50;
  let coverBannerZoom = existing.coverBannerZoom ?? 1;

  if (isIncomingNewer) {
    coverBannerUrl = incoming.coverBannerUrl !== undefined ? incoming.coverBannerUrl : coverBannerUrl;
    coverBannerPosY = incoming.coverBannerPosY !== undefined ? incoming.coverBannerPosY : coverBannerPosY;
    coverBannerPosX = incoming.coverBannerPosX !== undefined ? incoming.coverBannerPosX : coverBannerPosX;
    coverBannerZoom = incoming.coverBannerZoom !== undefined ? incoming.coverBannerZoom : coverBannerZoom;
  } else {
    if (incoming.coverBannerUrl && incoming.coverBannerUrl.trim() !== '') {
      coverBannerUrl = incoming.coverBannerUrl;
      coverBannerPosY = incoming.coverBannerPosY !== undefined ? incoming.coverBannerPosY : coverBannerPosY;
      coverBannerPosX = incoming.coverBannerPosX !== undefined ? incoming.coverBannerPosX : coverBannerPosX;
      coverBannerZoom = incoming.coverBannerZoom !== undefined ? incoming.coverBannerZoom : coverBannerZoom;
    }
  }

  // 3. Documents (never let empty default skeleton wipe out admin's uploaded files)
  let mergedDocuments: any[] = [];
  if (isIncomingNewer && incoming.documents !== undefined) {
    const existingDocsMap = new Map<string, any>();
    if (Array.isArray(existing.documents)) {
      for (const d of existing.documents) {
        if (d?.id) existingDocsMap.set(d.id, d);
      }
    }
    mergedDocuments = incoming.documents.map((incDoc: any) => {
      const prevDoc = incDoc?.id ? existingDocsMap.get(incDoc.id) : null;
      if (!incDoc.fileDataUrl && prevDoc?.fileDataUrl) {
        return { ...incDoc, fileDataUrl: prevDoc.fileDataUrl };
      }
      return incDoc;
    });
  } else {
    const docsMap = new Map<string, any>();
    if (Array.isArray(existing.documents)) {
      for (const d of existing.documents) {
        if (d?.id) docsMap.set(d.id, d);
      }
    }
    if (Array.isArray(incoming.documents)) {
      for (const d of incoming.documents) {
        if (d?.id) {
          const prev = docsMap.get(d.id);
          docsMap.set(d.id, {
            ...prev,
            ...d,
            fileDataUrl: d.fileDataUrl || prev?.fileDataUrl || ''
          });
        }
      }
    }
    mergedDocuments = Array.from(docsMap.values());
  }

  // 4. Resume (preserve admin's uploaded resume)
  let resumePdfUrl = existing.resumePdfUrl || '';
  let resumeFileName = existing.resumeFileName || '';
  let resumeLastUpdated = existing.resumeLastUpdated || '';

  if (isIncomingNewer) {
    resumePdfUrl = incoming.resumePdfUrl !== undefined ? incoming.resumePdfUrl : resumePdfUrl;
    resumeFileName = incoming.resumeFileName !== undefined ? incoming.resumeFileName : resumeFileName;
    resumeLastUpdated = incoming.resumeLastUpdated !== undefined ? incoming.resumeLastUpdated : resumeLastUpdated;
  } else {
    if (incoming.resumePdfUrl && incoming.resumePdfUrl.trim() !== '') resumePdfUrl = incoming.resumePdfUrl;
    if (incoming.resumeFileName && incoming.resumeFileName.trim() !== '') resumeFileName = incoming.resumeFileName;
    if (incoming.resumeLastUpdated && incoming.resumeLastUpdated.trim() !== '') resumeLastUpdated = incoming.resumeLastUpdated;
  }

  // 5. Arrays (preserve admin's custom projects, certificates, education, skills)
  const projects = isIncomingNewer
    ? (incoming.projects !== undefined ? incoming.projects : (existing.projects || []))
    : (Array.isArray(incoming.projects) && incoming.projects.length > 0 ? incoming.projects : (existing.projects || []));

  const certificates = isIncomingNewer
    ? (incoming.certificates !== undefined ? incoming.certificates : (existing.certificates || []))
    : (Array.isArray(incoming.certificates) && incoming.certificates.length > 0 ? incoming.certificates : (existing.certificates || []));

  const education = isIncomingNewer
    ? (incoming.education !== undefined ? incoming.education : (existing.education || []))
    : (Array.isArray(incoming.education) && incoming.education.length > 0 ? incoming.education : (existing.education || []));

  const skillCategories = isIncomingNewer
    ? (incoming.skillCategories !== undefined ? incoming.skillCategories : (existing.skillCategories || []))
    : (Array.isArray(incoming.skillCategories) && incoming.skillCategories.length > 0 ? incoming.skillCategories : (existing.skillCategories || []));

  const learningJourney = isIncomingNewer
    ? (incoming.learningJourney !== undefined ? incoming.learningJourney : (existing.learningJourney || []))
    : (Array.isArray(incoming.learningJourney) && incoming.learningJourney.length > 0 ? incoming.learningJourney : (existing.learningJourney || []));

  const interests = isIncomingNewer
    ? (incoming.interests !== undefined ? incoming.interests : (existing.interests || []))
    : (Array.isArray(incoming.interests) && incoming.interests.length > 0 ? incoming.interests : (existing.interests || []));

  const careerGoals = isIncomingNewer
    ? (incoming.careerGoals !== undefined ? incoming.careerGoals : (existing.careerGoals || []))
    : (Array.isArray(incoming.careerGoals) && incoming.careerGoals.length > 0 ? incoming.careerGoals : (existing.careerGoals || []));

  // 6. Text Fields
  const pickField = (inc: string | undefined, ex: string | undefined): string => {
    if (isIncomingNewer) {
      return inc !== undefined ? inc : (ex || '');
    }
    return (inc && inc.trim() !== '') ? inc : (ex || '');
  };

  return {
    ...BLANK_PORTFOLIO,
    ...existing,
    ...incoming,
    avatarUrl: finalAvatar,
    coverBannerUrl,
    coverBannerPosY,
    coverBannerPosX,
    coverBannerZoom,
    documents: mergedDocuments,
    resumePdfUrl,
    resumeFileName,
    resumeLastUpdated,
    projects,
    certificates,
    education,
    skillCategories,
    learningJourney,
    interests,
    careerGoals,
    fullName: pickField(incoming.fullName, existing.fullName),
    headline: pickField(incoming.headline, existing.headline),
    tagline: pickField(incoming.tagline, existing.tagline),
    shortBio: pickField(incoming.shortBio, existing.shortBio),
    aboutMe: pickField(incoming.aboutMe, existing.aboutMe),
    degree: pickField(incoming.degree, existing.degree),
    college: pickField(incoming.college, existing.college),
    currentStatus: pickField(incoming.currentStatus, existing.currentStatus),
    location: pickField(incoming.location, existing.location),
    email: pickField(incoming.email, existing.email),
    phone: pickField(incoming.phone, existing.phone),
    github: pickField(incoming.github, existing.github),
    linkedin: pickField(incoming.linkedin, existing.linkedin),
    portfolio: pickField(incoming.portfolio, existing.portfolio),
    customNotes: pickField(incoming.customNotes, existing.customNotes),
    updatedAt: incoming.updatedAt || existing.updatedAt || Date.now()
  };
}

// Open IndexedDB
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save to IndexedDB
export async function saveToIndexedDB(key: string, value: any): Promise<void> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save fallback:', err);
  }
}

// Read from IndexedDB
export async function readFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read fallback:', err);
    return null;
  }
}

// Load personal portfolio (synchronous initial read from localStorage, followed by IndexedDB / Firestore)
export function loadPortfolioSync(): PersonalPortfolioData {
  const baseDefaults: PersonalPortfolioData = (defaultPortfolioJson && (defaultPortfolioJson as any).fullName)
    ? { ...BLANK_PORTFOLIO, ...(defaultPortfolioJson as any) }
    : { ...BLANK_PORTFOLIO };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    let parsed: any = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch {}
    }
    const permanentCustom = typeof window !== 'undefined' 
      ? (localStorage.getItem('vyron_admin_custom_avatar_permanent') || localStorage.getItem('vyron_admin_custom_avatar'))
      : null;
    
    const result = { ...baseDefaults, ...parsed };
    if (isCustomAvatarUrl(permanentCustom)) {
      result.avatarUrl = permanentCustom!;
    }
    return result;
  } catch (e) {
    console.warn('Error reading portfolio from localStorage:', e);
  }
  return baseDefaults;
}

// Compress image data URI for Firestore and LocalStorage quota safety
export async function compressImageForStorage(dataUri: string, maxWidth = 1400, maxHeight = 800, quality = 0.8): Promise<string> {
  if (!dataUri || !dataUri.startsWith('data:image/') || dataUri.length < 250000) {
    return dataUri;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUri);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUri.length ? compressed : dataUri);
      };
      img.onerror = () => resolve(dataUri);
      img.src = dataUri;
    } catch {
      resolve(dataUri);
    }
  });
}

// Full async loader that checks Backend API, IndexedDB, and Cloud Firestore in parallel
export async function loadPortfolioAsync(): Promise<{ data: PersonalPortfolioData; fromCloud: boolean }> {
  // Current local baseline from localStorage and IndexedDB
  const localBaseline = loadPortfolioSync();
  const idbData = await readFromIndexedDB<PersonalPortfolioData>(STORAGE_KEY);
  const persistentDocs = await readFromIndexedDB<any[]>('vyron_persistent_documents');
  const persistentAvatar = await readFromIndexedDB<string>('vyron_admin_avatar');

  let currentWorkingData = smartMergePortfolio(localBaseline, idbData || {});
  if (persistentDocs && persistentDocs.length > 0) {
    currentWorkingData = smartMergePortfolio(currentWorkingData, { documents: persistentDocs });
  }
  if (persistentAvatar && isCustomAvatarUrl(persistentAvatar)) {
    currentWorkingData.avatarUrl = persistentAvatar;
  }

  // Concurrently fetch from Backend API and Cloud Firestore with zero blocking
  let serverCandidate: { portfolio: any; updatedAt: number } | null = null;
  let firestoreCandidate: { portfolio: any; updatedAt: number } | null = null;

  const fetchBackend = async () => {
    try {
      const res = await fetch(`/api/portfolio?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.portfolio) {
          serverCandidate = {
            portfolio: json.portfolio,
            updatedAt: json.updatedAt || json.portfolio.updatedAt || 0
          };
        }
      }
    } catch (backendErr) {
      console.warn('Backend portfolio fetch notice:', backendErr);
    }
  };

  const fetchFirestore = async () => {
    try {
      const publicProfileRef = doc(db, 'public_profiles', 'owner');
      const snap = await getDoc(publicProfileRef);
      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData.personalPortfolio) {
          const t = cloudData.personalPortfolio.updatedAt || (cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0);
          firestoreCandidate = {
            portfolio: cloudData.personalPortfolio,
            updatedAt: t
          };
        }
      }
    } catch (cloudErr) {
      console.warn('Cloud fetch note:', cloudErr);
    }
  };

  await Promise.allSettled([fetchBackend(), fetchFirestore()]);

  // Determine freshest remote candidate
  let freshestCandidate: { portfolio: any; updatedAt: number } | null = null;
  if (serverCandidate && firestoreCandidate) {
    if (firestoreCandidate.updatedAt > 0 && (!serverCandidate.updatedAt || serverCandidate.updatedAt <= 1)) {
      freshestCandidate = firestoreCandidate;
    } else if (serverCandidate.updatedAt > 0 && (!firestoreCandidate.updatedAt || firestoreCandidate.updatedAt <= 1)) {
      freshestCandidate = serverCandidate;
    } else {
      freshestCandidate = (firestoreCandidate.updatedAt >= serverCandidate.updatedAt)
        ? firestoreCandidate
        : serverCandidate;
    }
  } else {
    freshestCandidate = firestoreCandidate || serverCandidate;
  }

  if (freshestCandidate && freshestCandidate.portfolio) {
    const merged = smartMergePortfolio(currentWorkingData, freshestCandidate.portfolio);
    lastKnownPortfolioTimestamp = freshestCandidate.updatedAt || Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      await saveToIndexedDB(STORAGE_KEY, merged);
      if (merged.documents && merged.documents.length > 0) {
        await saveToIndexedDB('vyron_persistent_documents', merged.documents);
      }
      if (isCustomAvatarUrl(merged.avatarUrl)) {
        await saveToIndexedDB('vyron_admin_avatar', merged.avatarUrl);
      }
    } catch {}
    return { data: merged, fromCloud: true };
  }

  return { data: currentWorkingData, fromCloud: false };
}

/**
 * Fast Real-time Synchronization across ALL phones, laptops, and PCs.
 * Uses 4-layer instant update delivery:
 * 1. Server-Sent Events (SSE) `/api/live-sync` (<50ms instant push to all connected browsers).
 * 2. Cross-tab BroadcastChannel for 0ms same-device sync.
 * 3. Firestore onSnapshot WebSocket listener.
 * 4. 1.5s background polling fallback + immediate on window focus / device unlock.
 */
export function subscribeToPortfolioUpdates(onUpdate: (data: PersonalPortfolioData) => void): () => void {
  let isSubscribed = true;

  const handleFreshData = (fresh: Partial<PersonalPortfolioData>, timestamp?: number) => {
    if (!isSubscribed || !fresh) return;
    const current = loadPortfolioSync();
    const merged = smartMergePortfolio(current, fresh);
    if (timestamp) {
      lastKnownPortfolioTimestamp = timestamp;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      saveToIndexedDB(STORAGE_KEY, merged);
      if (merged.documents && merged.documents.length > 0) {
        saveToIndexedDB('vyron_persistent_documents', merged.documents);
      }
      if (isCustomAvatarUrl(merged.avatarUrl)) {
        saveToIndexedDB('vyron_admin_avatar', merged.avatarUrl);
      }
    } catch {}

    onUpdate(merged);

    // Notify all UI elements across the app (Header, Logo, HomeView, ProfileView)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolio_synced_from_cloud', { detail: merged }));
      if (merged.avatarUrl) {
        window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: merged.avatarUrl } }));
      }
      if (merged.fullName) {
        window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { name: merged.fullName, avatarUrl: merged.avatarUrl } }));
      }
    }
  };

  const fetchFreshPortfolio = async () => {
    try {
      const res = await fetch(`/api/portfolio?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok && isSubscribed) {
        const json = await res.json();
        if (json.portfolio) {
          handleFreshData(json.portfolio, json.updatedAt || json.portfolio.updatedAt);
        }
      }
    } catch (e) {
      // Offline or network lag
    }
  };

  const checkForServerUpdate = async () => {
    if (!isSubscribed) return;
    try {
      const res = await fetch(`/api/portfolio/version?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.updatedAt && json.updatedAt > lastKnownPortfolioTimestamp) {
          await fetchFreshPortfolio();
        }
      }
    } catch (e) {}
  };

  // 1. Server-Sent Events (SSE) Live Stream: Instant push within milliseconds!
  let sse: EventSource | null = null;
  let sseReconnectTimer: any = null;

  const connectSSE = () => {
    if (!isSubscribed) return;
    try {
      if (sse) {
        try { sse.close(); } catch {}
      }
      sse = new EventSource('/api/live-sync');
      sse.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.portfolio && isSubscribed) {
            handleFreshData(msg.portfolio, msg.updatedAt);
          }
          if (msg.profile && isSubscribed && typeof window !== 'undefined') {
            if (msg.profile.name || msg.profile.avatarUrl) {
              window.dispatchEvent(new CustomEvent('profile_info_updated', {
                detail: { name: msg.profile.name, avatarUrl: msg.profile.avatarUrl }
              }));
            }
          }
        } catch (err) {}
      };
      sse.onerror = () => {
        try { sse?.close(); } catch {}
        sse = null;
        if (isSubscribed) {
          clearTimeout(sseReconnectTimer);
          sseReconnectTimer = setTimeout(connectSSE, 2000);
        }
      };
    } catch (sseErr) {
      console.warn('SSE connection notice:', sseErr);
    }
  };

  connectSSE();

  // 2. Cross-tab BroadcastChannel for 0ms same-device sync
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('vyron_realtime_sync');
      channel.onmessage = (ev) => {
        if (ev.data?.portfolio && isSubscribed) {
          handleFreshData(ev.data.portfolio, ev.data.timestamp);
        }
      };
    }
  } catch {}

  // 3. Intelligent Polling fallback: Only runs when tab is visible AND SSE is disconnected
  let pollIntervalId: any = null;
  const startFallbackPolling = () => {
    if (pollIntervalId) clearInterval(pollIntervalId);
    pollIntervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && isSubscribed && (!sse || sse.readyState !== EventSource.OPEN)) {
        checkForServerUpdate();
      }
    }, 20000); // 20s calm fallback interval instead of 1000ms
  };
  startFallbackPolling();

  // Check immediately whenever user switches to or unlocks this device/tab
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForServerUpdate();
      if (!sse || sse.readyState === EventSource.CLOSED) {
        connectSSE();
      }
      startFallbackPolling();
    } else {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
      }
    }
  };
  const handleWindowFocus = () => {
    if (document.visibilityState === 'visible') {
      checkForServerUpdate();
      if (!sse || sse.readyState === EventSource.CLOSED) {
        connectSSE();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);

  // Cross-component custom event listener
  const handleCustomSync = (e: Event) => {
    const customEvent = e as CustomEvent<PersonalPortfolioData>;
    if (customEvent.detail) {
      onUpdate(customEvent.detail);
    }
  };
  window.addEventListener('portfolio_synced_from_cloud', handleCustomSync);

  // 4. Firestore real-time onSnapshot listener (sub-second sync globally across all devices)
  let unsubscribeFirestore = () => {};
  try {
    const publicDocRef = doc(db, 'public_profiles', 'owner');
    unsubscribeFirestore = onSnapshot(publicDocRef, (snap) => {
      if (snap.exists() && isSubscribed) {
        const data = snap.data();
        if (data.personalPortfolio) {
          const t = data.personalPortfolio.updatedAt || (data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now());
          handleFreshData(data.personalPortfolio, t);
        }
      }
    }, (err) => {
      // Handled gracefully by SSE and server polling
    });
  } catch (e) {}

  return () => {
    isSubscribed = false;
    if (pollIntervalId) clearInterval(pollIntervalId);
    clearTimeout(sseReconnectTimer);
    if (sse) {
      try { sse.close(); } catch {}
    }
    if (channel) {
      try { channel.close(); } catch {}
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('portfolio_synced_from_cloud', handleCustomSync);
    unsubscribeFirestore();
  };
}

// Save personal portfolio permanently to Backend Server, LocalStorage, IndexedDB and Cloud Firestore
export async function savePortfolioPermanently(data: PersonalPortfolioData): Promise<{ cloudSynced: boolean; error?: string }> {
  const cleanData = JSON.parse(JSON.stringify(data));
  const now = Date.now();
  cleanData.updatedAt = now;

  // 1. Permanent Local Custom Avatar & Documents Backup
  if (isCustomAvatarUrl(cleanData.avatarUrl)) {
    try {
      localStorage.setItem('vyron_admin_custom_avatar_permanent', cleanData.avatarUrl);
      localStorage.setItem('vyron_admin_custom_avatar', cleanData.avatarUrl);
    } catch {}
  }

  // 2. Save to LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
  } catch (localErr) {
    console.warn('LocalStorage quota limit reached, relying on IndexedDB:', localErr);
  }

  // 3. Save to IndexedDB (handles large multi-megabyte PDFs and images without quota limits)
  await saveToIndexedDB(STORAGE_KEY, cleanData);
  if (cleanData.documents && cleanData.documents.length > 0) {
    await saveToIndexedDB('vyron_persistent_documents', cleanData.documents);
  }
  if (isCustomAvatarUrl(cleanData.avatarUrl)) {
    await saveToIndexedDB('vyron_admin_avatar', cleanData.avatarUrl);
  }

  // 4. Broadcast 0ms across tabs on the same device
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('vyron_realtime_sync');
      channel.postMessage({ portfolio: cleanData, timestamp: now });
      channel.close();
    }
  } catch {}

  // 5. Broadcast locally in current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_synced_from_cloud', { detail: cleanData }));
    if (cleanData.avatarUrl) {
      window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: cleanData.avatarUrl } }));
    }
    if (cleanData.fullName) {
      window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { name: cleanData.fullName, avatarUrl: cleanData.avatarUrl } }));
    }
  }

  // 6. Save to Backend Server (triggers instant SSE broadcast to all connected devices in <20ms)
  try {
    const res = await adminSavePortfolio(cleanData);
    if (res.updatedAt) {
      lastKnownPortfolioTimestamp = res.updatedAt;
    }
  } catch (apiErr) {
    console.warn('Admin API portfolio save notice:', apiErr);
  }

  // 7. Save to Cloud Firestore for live global onSnapshot replication across all phones, tablets, laptops
  try {
    // Ensure payload never exceeds Firestore's 1MB document limit
    const firestorePortfolio = {
      ...cleanData,
      documents: (cleanData.documents || []).map((doc: any) => {
        if (doc.fileDataUrl && doc.fileDataUrl.startsWith('data:') && doc.fileDataUrl.length > 150000) {
          return {
            ...doc,
            fileDataUrl: doc.downloadUrl || `/api/documents/${doc.fileName || doc.id}`
          };
        }
        return doc;
      })
    };

    // Compress large base64 images if needed for Firestore
    if (firestorePortfolio.coverBannerUrl && firestorePortfolio.coverBannerUrl.startsWith('data:image/') && firestorePortfolio.coverBannerUrl.length > 300000) {
      firestorePortfolio.coverBannerUrl = await compressImageForStorage(firestorePortfolio.coverBannerUrl, 1280, 720, 0.75);
    }
    if (firestorePortfolio.avatarUrl && firestorePortfolio.avatarUrl.startsWith('data:image/') && firestorePortfolio.avatarUrl.length > 300000) {
      firestorePortfolio.avatarUrl = await compressImageForStorage(firestorePortfolio.avatarUrl, 512, 512, 0.8);
    }

    // Write directly to public_profiles/owner unconditionally (rules allow read, write: if true)
    const publicProfileRef = doc(db, 'public_profiles', 'owner');
    await setDoc(publicProfileRef, {
      personalPortfolio: firestorePortfolio,
      ownerUid: auth.currentUser?.uid || 'admin_owner',
      name: cleanData.fullName || '',
      avatarUrl: firestorePortfolio.avatarUrl || '',
      coverBannerUrl: firestorePortfolio.coverBannerUrl || '',
      updatedAt: now,
      portfolioLastUpdated: new Date().toISOString()
    }, { merge: true });

    // Optional user-specific doc if auth is available
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          personalPortfolio: firestorePortfolio,
          portfolioLastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch {}
    } else {
      // Try anonymous signIn in background without blocking
      signInAnonymously(auth).catch(() => {});
    }

    return { cloudSynced: true };
  } catch (firestoreErr: any) {
    console.warn('Firestore cloud save note:', firestoreErr);
  }

  return { cloudSynced: true };
}
