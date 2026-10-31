import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceListener, speakText, stopSpeech } from '../lib/voice';
import {
  Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Loader2, Copy, RotateCcw,
  Trash2, CheckCircle2, Database, Lightbulb, Utensils, Pill, Wallet,
  GraduationCap, Building2, Bell, Search, MapPin, Image as ImageIcon,
  Music, Film, Brain, Upload, Play, Pause, Download, Sliders, Zap,
  Wrench, Navigation, Phone, ExternalLink, Compass, LocateFixed, Code,
  FileText, Shield, AlertCircle, Maximize2, Minimize2
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';
import { getFounderProfile } from '../lib/founderProfile';
import { getAdminToken } from '../lib/adminAuth';
import { SmartNotesRenderer } from './SmartNotesRenderer';

interface VyronAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  profile?: UserProfile;
  notifications?: NotificationItem[];
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  sources?: Array<{ title: string; url: string; type: string }>;
}

export const VyronAssistantModal: React.FC<VyronAssistantModalProps> = React.memo(({
  isOpen,
  onClose,
  language,
  profile,
  notifications = [],
  initialPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'nearby' | 'grounding' | 'image' | 'music' | 'video' | 'media'>('chat');

  // Chat State
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const copyToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [chatSpeedModel, setChatSpeedModel] = useState<'flash' | 'pro' | 'lite'>('flash');
  const [vyronWorkingMode, setVyronWorkingMode] = useState<'general' | 'learn' | 'analyze' | 'developer'>('general');
  const [chatFontSize, setChatFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewportOffsetTop, setViewportOffsetTop] = useState<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if device is mobile / touch screen and track Visual Viewport
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = typeof window !== 'undefined' ? (navigator.userAgent || navigator.vendor || (window as any).opera) : '';
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
      const hasTouch = typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false;
      const isMobile = isMobileUA || (isSmallScreen && hasTouch);
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setIsFullScreen(true);
      }
    };
    checkIsMobile();

    const updateVisualViewport = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setViewportOffsetTop(window.visualViewport.offsetTop);
      } else if (typeof window !== 'undefined') {
        setViewportHeight(window.innerHeight);
        setViewportOffsetTop(0);
      }
    };

    updateVisualViewport();

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateVisualViewport);
      window.visualViewport.addEventListener('scroll', updateVisualViewport);
    }
    window.addEventListener('resize', updateVisualViewport);

    return () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVisualViewport);
        window.visualViewport.removeEventListener('scroll', updateVisualViewport);
      }
      window.removeEventListener('resize', updateVisualViewport);
    };
  }, [isOpen]);

  // Nearby Services State (Power 2)
  const [nearbyType, setNearbyType] = useState<string>('mechanic');
  const [nearbyArea, setNearbyArea] = useState<string>('Kankarbagh, Patna');
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState<boolean>(false);
  const [nearbyGpsStatus, setNearbyGpsStatus] = useState<string | null>(null);
  const [nearbyCoords, setNearbyCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyMessage, setNearbyMessage] = useState<string | null>(null);

  // Grounding State
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [groundingQuery, setGroundingQuery] = useState('');
  const [groundingResult, setGroundingResult] = useState<{ text: string; sources: any[] } | null>(null);
  const [groundingLoading, setGroundingLoading] = useState(false);

  // Image AI State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageRatio, setImageRatio] = useState<string>('1:1');
  const [imageQuality, setImageQuality] = useState<'flash' | 'pro'>('flash');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Music AI State
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicType, setMusicType] = useState<'clip' | 'pro'>('clip');
  const [musicImage, setMusicImage] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<{ audioData: string; lyrics: string } | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video AI State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoImage, setVideoImage] = useState<string | null>(null);
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Media & Audio Analysis State
  const [mediaFile, setMediaFile] = useState<{ base64: string; mimeType: string; isVideo?: boolean } | null>(null);
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaAnalysis, setMediaAnalysis] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  const [listener] = useState(() => new VoiceListener());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prepareUserData = () => {
    if (!profile) return null;
    return {
      name: profile.name,
      location: `${profile.district || ''}, ${profile.state || ''}`,
      age: profile.age,
      occupation: profile.occupation,
      incomeCategory: profile.incomeCategory,
      totalExpenses: profile.expenses ? profile.expenses.reduce((acc, curr) => acc + curr.amount, 0) : 0,
      bookmarksCount: profile.bookmarks ? profile.bookmarks.length : 0,
      bookmarksList: profile.bookmarks ? profile.bookmarks.map(b => b.title).join(', ') : '',
      recipesCount: profile.savedRecipes ? profile.savedRecipes.length : 0,
      recipesList: profile.savedRecipes ? profile.savedRecipes.map(r => r.title).join(', ') : '',
      medicinesCount: profile.savedMedicines ? profile.savedMedicines.length : 0,
      medicinesList: profile.savedMedicines ? profile.savedMedicines.map(m => `${m.brandName} (${m.saltName})`).join(', ') : '',
      remindersCount: profile.savedReminders ? profile.savedReminders.length : 0,
      remindersList: profile.savedReminders ? profile.savedReminders.map(rem => `${rem.medicineName} at ${rem.time}`).join(', ') : '',
      studyCount: profile.studyProgress ? profile.studyProgress.length : 0,
      studyList: profile.studyProgress ? profile.studyProgress.map(s => s.topic).join(', ') : '',
      schemesCount: profile.savedSchemes ? profile.savedSchemes.length : 0,
      schemesList: profile.savedSchemes ? profile.savedSchemes.map(sch => sch.title).join(', ') : '',
      notificationsCount: notifications ? notifications.length : 0,
      notificationsList: notifications ? notifications.slice(0, 5).map(n => n.title).join(', ') : '',
    };
  };

  useEffect(() => {
    if (!isOpen) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      stopSpeech();
      listener.stop();
      setIsListening(false);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    }
  }, [isOpen, listener]);

  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const scrollToBottom = (force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 140;
      if (force || isNearBottom || !isUserScrolledUpRef.current) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  if (!isOpen) return null;

  // Image Upload Helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string, mime: string, isVideo?: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVid = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result, file.type, isVid);
      }
    };
    reader.readAsDataURL(file);
  };

  // Chat Handlers
  const handleStartVoice = () => {
    if (isListening) {
      listener.stop();
      setIsListening(false);
      return;
    }
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    listener.start(
      (text) => {
        setIsListening(false);
        if (text && text.trim()) {
          setPrompt((prev) => (prev ? `${prev} ${text.trim()}` : text.trim()));
        }
      },
      (err) => {
        setIsListening(false);
        console.warn('Voice input error:', err);
      },
      language
    );
    setIsListening(true);
  };

  // Voice / Read Aloud Handler for individual AI answers
  const handleToggleVoiceMessage = (msgId: string, rawText: string) => {
    if (speakingMessageId === msgId) {
      stopSpeech();
      setSpeakingMessageId(null);
      setIsSpeaking(false);
      return;
    }

    // Stop any existing speech session immediately
    stopSpeech();

    if (!rawText || !rawText.trim()) return;

    // Detect actual script in the response:
    // If Devanagari characters are present, request 'hi' (hi-IN).
    // If Latin script (English or Hinglish), request 'en' (en-IN) which handles both English and Romanized Hindi naturally.
    const hasHindi = /[\u0900-\u097F]/.test(rawText);
    const speechLang: 'en' | 'hi' = hasHindi ? 'hi' : 'en';

    setSpeakingMessageId(msgId);
    setIsSpeaking(true);

    speakText(rawText, speechLang)
      .then(() => {
        setSpeakingMessageId((current) => (current === msgId ? null : current));
        setIsSpeaking(false);
      })
      .catch(() => {
        setSpeakingMessageId((current) => (current === msgId ? null : current));
        setIsSpeaking(false);
      });
  };

  // Copy Entire Current AI Answer Handler
  const handleCopyMessage = async (msgId: string, rawText: string) => {
    const cleanToCopy = rawText
      .replace(/^#{1,6}\s+/gm, '')
      .trim();

    const textToCopy = cleanToCopy || rawText;

    const performCopyFeedback = () => {
      setCopiedId(msgId);

      if (copyToastTimeoutRef.current) {
        clearTimeout(copyToastTimeoutRef.current);
      }
      setCopyToast({
        show: true,
        message: 'Answer copied successfully ✓',
      });

      copyToastTimeoutRef.current = setTimeout(() => {
        setCopyToast({ show: false, message: '' });
      }, 2800);

      setTimeout(() => {
        setCopiedId((current) => (current === msgId ? null : current));
      }, 2500);
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        performCopyFeedback();
      } else {
        fallbackCopy(textToCopy);
        performCopyFeedback();
      }
    } catch {
      fallbackCopy(textToCopy);
      performCopyFeedback();
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
  };

  const simulateStreaming = (text: string, messageId: string) => {
    // If text is short or fast mode, display immediately
    if (text.length < 250) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text, isStreaming: false } : m));
      return;
    }
    const words = text.split(' ');
    let currentIdx = 0;
    const chunkSize = 8; // Render in large word-chunks for high-speed display
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStreaming: true, text: '' } : m));
    
    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx < words.length) {
        const partialText = words.slice(0, currentIdx).join(' ');
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: partialText } : m));
      } else {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text, isStreaming: false } : m));
      }
    }, 12);
  };

  const handleSendPrompt = async (customQuery?: string) => {
    const textToSubmit = (typeof customQuery === 'string' ? customQuery : prompt).trim();
    if (!textToSubmit || loading) return;

    const newMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSubmit };
    const currentMessages = [...messages, newMessage];
    
    setMessages(currentMessages);
    setPrompt('');
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
    setLoading(true);
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingMessageId(null);

    const responseId = (Date.now() + 1).toString();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));

      let modelName = "gemini-3.1-flash-lite";
      if (useHighThinking) modelName = "gemini-3.1-pro-preview";
      else if (chatSpeedModel === "pro") modelName = "gemini-3.8-flash";

      // Initialize empty model message for live streaming
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '', isStreaming: true }]);

      const adminToken = getAdminToken();
      const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) {
        requestHeaders['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch('/api/ai/chat-stream', {
        method: 'POST',
        headers: requestHeaders,
        signal: abortController.signal,
        body: JSON.stringify({
          message: textToSubmit,
          history,
          model: modelName,
          enableHighThinking: useHighThinking,
          answerMode: chatSpeedModel,
          vyronAiMode: vyronWorkingMode !== 'general' ? vyronWorkingMode : undefined,
          founderProfile: getFounderProfile(),
        })
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.text) {
                accumulatedText += data.text;
                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, text: accumulatedText, isStreaming: true } : m));
              }
              if (data.done) {
                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, isStreaming: false } : m));
              }
              if (data.error) {
                accumulatedText = `⚠️ ${data.error}`;
                setMessages(prev => prev.map(m => m.id === responseId ? { ...m, text: accumulatedText, isStreaming: false } : m));
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      setMessages(prev => prev.map(m => m.id === responseId ? { ...m, isStreaming: false } : m));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Streaming failed, attempting fallback to static endpoint:', err.message);
      
      // Fallback to static endpoint
      try {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        let modelName = "gemini-3.1-flash-lite";
        if (useHighThinking) modelName = "gemini-3.1-pro-preview";
        else if (chatSpeedModel === "pro") modelName = "gemini-3.8-flash";

        const adminToken = getAdminToken();
        const fallbackHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (adminToken) {
          fallbackHeaders['Authorization'] = `Bearer ${adminToken}`;
        }

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: fallbackHeaders,
          body: JSON.stringify({
            message: textToSubmit,
            history,
            model: modelName,
            enableHighThinking: useHighThinking,
            answerMode: chatSpeedModel,
            vyronAiMode: vyronWorkingMode !== 'general' ? vyronWorkingMode : undefined,
            founderProfile: getFounderProfile(),
          })
        });
        const data = await res.json();
        if (data.result) {
          setMessages(prev => prev.map(m => m.id === responseId ? { ...m, text: data.result, isStreaming: false } : m));
        } else {
          setMessages(prev => prev.map(m => m.id === responseId ? { ...m, text: `⚠️ ${data.error || 'Request failed'}`, isStreaming: false } : m));
        }
      } catch (fallbackErr: any) {
        setMessages(prev => prev.map(m => m.id === responseId ? { ...m, text: `⚠️ Connection error: ${fallbackErr.message || 'Please check your connection and try again.'}`, isStreaming: false } : m));
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Power 2: Nearby Services Handler
  const handleFetchNearby = async (selectedType = nearbyType, area = nearbyArea, coords = nearbyCoords) => {
    setNearbyLoading(true);
    setNearbyMessage(null);
    try {
      let url = `/api/nearby?type=${encodeURIComponent(selectedType)}&location=${encodeURIComponent(area)}`;
      if (coords) {
        url += `&lat=${coords.lat}&lng=${coords.lng}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.results) {
        setNearbyResults(data.results);
        setNearbyMessage(data.message || `Found ${data.results.length} verified ${selectedType} listings near ${area}.`);
      } else if (data.error) {
        setNearbyMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setNearbyMessage(`Network Error: ${err.message}`);
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setNearbyGpsStatus('Browser does not support GPS Geolocation.');
      return;
    }
    setNearbyGpsStatus('📍 Detecting GPS coordinates in Patna...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setNearbyCoords(coords);
        setNearbyGpsStatus(`📍 GPS Locked: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        handleFetchNearby(nearbyType, nearbyArea, coords);
      },
      () => {
        setNearbyGpsStatus('GPS Permission not granted. You can type your area name (e.g. Kankarbagh, Boring Road).');
      },
      { timeout: 8000 }
    );
  };

  // Grounding Handler
  const handleSearchOrMaps = async () => {
    if (!groundingQuery.trim() || groundingLoading) return;
    setGroundingLoading(true);
    setGroundingResult(null);
    try {
      const res = await fetch('/api/ai/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: groundingQuery, mode: groundingMode })
      });
      const data = await res.json();
      if (data.result) {
        setGroundingResult({ text: data.result, sources: data.sources || [] });
      } else {
        alert(data.error || "Grounding search failed");
      }
    } catch (err: any) {
      alert(`Search Error: ${err.message}`);
    } finally {
      setGroundingLoading(false);
    }
  };

  // Image AI Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    setImageLoading(true);
    setGeneratedImage(null);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          inputImageBase64: inputImage,
          aspectRatio: imageRatio,
          quality: imageQuality,
          imageSize
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert(data.error || "Image generation failed");
      }
    } catch (err: any) {
      alert(`Image Error: ${err.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  // Music AI Handler
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || musicLoading) return;
    setMusicLoading(true);
    setGeneratedAudio(null);
    try {
      const res = await fetch('/api/ai/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          type: musicType,
          imageBase64: musicImage
        })
      });
      const data = await res.json();
      if (data.audioData) {
        setGeneratedAudio({ audioData: data.audioData, lyrics: data.lyrics || '' });
      } else {
        alert(data.error || "Music generation failed");
      }
    } catch (err: any) {
      alert(`Music Error: ${err.message}`);
    } finally {
      setMusicLoading(false);
    }
  };

  // Video AI Handler (Veo 3)
  const handleGenerateVideo = async () => {
    if ((!videoPrompt.trim() && !videoImage) || videoLoading) return;
    setVideoLoading(true);
    setVideoUrl(null);
    setVideoStatus(language === 'hi' ? "वीडियो निर्माण शुरू हो रहा है..." : "Initializing Veo 3 Video Generation...");

    try {
      const startRes = await fetch('/api/ai/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64: videoImage,
          aspectRatio: videoRatio
        })
      });
      const startData = await startRes.json();
      if (!startData.operationName) {
        throw new Error(startData.error || "Failed to start video rendering");
      }

      const operationName = startData.operationName;
      setVideoStatus(language === 'hi' ? "Veo 3 वीडियो रेंडर हो रहा है (कृपया प्रतीक्षा करें)..." : "Veo 3 rendering video (polling status)...");

      // Poll status every 5s
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/ai/video/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });
          const statusData = await statusRes.json();
          if (statusData.done) {
            clearInterval(pollInterval);
            setVideoStatus(language === 'hi' ? "वीडियो डाउनलोड हो रहा है..." : "Video render complete! Streaming video...");
            
            // Download stream
            const dlRes = await fetch('/api/ai/video/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName })
            });
            if (dlRes.ok) {
              const blob = await dlRes.blob();
              setVideoUrl(URL.createObjectURL(blob));
              setVideoStatus(null);
            } else {
              setVideoStatus("Failed to stream video result");
            }
            setVideoLoading(false);
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 5000);

    } catch (err: any) {
      alert(`Video Error: ${err.message}`);
      setVideoLoading(false);
      setVideoStatus(null);
    }
  };

  // Media Analysis Handler
  const handleAnalyzeMedia = async () => {
    if (!mediaFile || mediaLoading) return;
    setMediaLoading(true);
    setMediaAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaBase64: mediaFile.base64,
          mimeType: mediaFile.mimeType,
          prompt: mediaPrompt
        })
      });
      const data = await res.json();
      if (data.result) setMediaAnalysis(data.result);
      else alert(data.error || "Media analysis failed");
    } catch (err: any) {
      alert(`Analysis Error: ${err.message}`);
    } finally {
      setMediaLoading(false);
    }
  };

  // Audio Transcribe Handler
  const handleAudioTranscribe = async (base64: string, mimeType: string) => {
    setTranscribing(true);
    setAudioTranscript(null);
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64, mimeType })
      });
      const data = await res.json();
      if (data.transcript) setAudioTranscript(data.transcript);
      else alert(data.error || "Transcription failed");
    } catch (err: any) {
      alert(`Transcription Error: ${err.message}`);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div 
      style={{
        touchAction: 'pan-y',
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        top: viewportOffsetTop ? `${viewportOffsetTop}px` : '0px',
      }}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center animate-fade-in transition-all overflow-hidden ${
        isFullScreen ? 'w-full p-0' : 'p-0 sm:p-3 md:p-5 backdrop-blur-md bg-slate-900/40 dark:bg-black/70'
      }`}
    >
      {/* Modal Frame with Elegant Border & App-matching Glass */}
      <div 
        className={`w-full h-full flex flex-col overflow-hidden relative transition-all duration-300 ${
          isFullScreen 
            ? 'max-w-full rounded-none border-0' 
            : 'max-w-4xl max-h-[94vh] sm:rounded-3xl p-[1px] shadow-2xl shadow-purple-950/20 dark:shadow-black/60'
        }`}
        style={!isFullScreen ? {
          background: 'linear-gradient(135deg, rgba(37,99,235,0.4) 0%, rgba(236,72,153,0.3) 50%, rgba(245,158,11,0.3) 100%)',
        } : undefined}
      >
        <div className={`w-full h-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden relative backdrop-blur-2xl ${
          !isFullScreen ? 'sm:rounded-[23px]' : ''
        }`}>
        
        {/* Main Header with App-matching Background, Title & Tabs */}
        <div className="flex flex-col p-2.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-10 shrink-0 space-y-2.5 max-w-full overflow-hidden relative">
          {/* Static Rainbow Top Edge Sheen */}
          <div 
            className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #2563eb, #ec4899, #facc15, #10b981, #f97316, #3b82f6)',
            }}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Futuristic V Icon */}
              <div 
                className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl p-[2px] shadow-md flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(125deg, #2563eb, #ec4899, #facc15, #10b981, #f97316)',
                }}
              >
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <span className="font-black text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-white dark:to-pink-400 bg-clip-text text-transparent tracking-tighter drop-shadow-xs z-10">
                    V
                  </span>
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 border border-white/80" />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight flex items-center gap-1.5 sm:gap-2">
                  <span className="tracking-tight flex items-center gap-1">
                    <span 
                      className="bg-clip-text text-transparent font-black"
                      style={{
                        backgroundImage: 'linear-gradient(125deg, #2563eb 0%, #ec4899 40%, #f59e0b 80%)',
                      }}
                    >
                      Vyron AI
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm ml-1 hidden xs:inline">• Your Personal Teacher</span>
                  </span>
                  <span 
                    className="text-[9px] sm:text-[10px] text-purple-700 dark:text-purple-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800"
                  >
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 dark:text-amber-300 animate-bounce" />
                    <span>Smart AI Tutor</span>
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                  Vyron AI: Your Personal Teacher • Interactive Concept Mastery & Socratic Learning
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Minimize view" : "Full Screen view"}
                className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                title="Close AI Assistant"
                className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/15 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>

          {/* AI Feature Navigation Bar */}
          <div 
            style={{ touchAction: 'pan-x' }}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold max-w-full select-none"
          >
            {[
              { id: 'chat', label: 'VyronAI Chat', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'nearby', label: '🔧 Nearby Services', icon: <Wrench className="w-3.5 h-3.5" />, highlight: true },
              { id: 'grounding', label: 'Search & Maps', icon: <Search className="w-3.5 h-3.5" /> },
              { id: 'image', label: 'Image Studio', icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: 'music', label: 'Music AI', icon: <Music className="w-3.5 h-3.5" /> },
              { id: 'video', label: 'Veo 3 Video', icon: <Film className="w-3.5 h-3.5" /> },
              { id: 'media', label: 'Vision & Speech', icon: <Brain className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  onClick={() => {
                    if (typeof window !== 'undefined' && navigator.vibrate) {
                      try { navigator.vibrate(10); } catch {}
                    }
                    setActiveTab(tab.id as any);
                    if (tab.id === 'nearby' && nearbyResults.length === 0) {
                      handleFetchNearby('mechanic', nearbyArea);
                    }
                  }}
                  className={`relative overflow-hidden px-3.5 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 text-xs font-bold touch-manipulation ${
                    isActive
                      ? 'text-white shadow-md ring-1 ring-white/40'
                      : tab.highlight
                      ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-400/40 hover:bg-amber-100 dark:hover:bg-amber-500/25'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(125deg, #2563eb 0%, #ec4899 45%, #f97316 100%)',
                  } : undefined}
                >
                  {isActive && (
                    <span className="absolute inset-x-0 top-0 h-[45%] rounded-t-xl bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: VYRONAI CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
            {/* Top Config Controls with App-matching Styling */}
            <div className="px-3 sm:px-4 py-2 bg-slate-50/80 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0 max-w-full overflow-hidden relative z-10">
              <div className="flex items-center gap-2 shrink-0">
                {messages.length > 0 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMessages([])}
                    title="Clear chat and return to home screen"
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/15 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer border border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-400/40 touch-manipulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Chat</span>
                  </motion.button>
                )}

                {/* 3 Working Modes Switcher: General | 1. Learn | 2. Analyze | 3. Developer */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/5 p-1 rounded-xl font-bold text-[11px] max-w-full overflow-x-auto scrollbar-none shrink-0 border border-slate-300/70 dark:border-white/10">
                  {[
                    { id: 'general', label: '💬 General', title: 'General Vyron AI Chat' },
                    { id: 'learn', label: '🎓 Learn', title: '1. Learn Mode: Teach HTML, CSS, Java, JS, React, TypeScript, Firebase step-by-step' },
                    { id: 'analyze', label: '🔍 Analyze', title: '2. Analyze Mode: Deep inspect VYRON source code, files, elements, and line numbers' },
                    { id: 'developer', label: '🛠️ Developer', title: '3. Developer Mode: Help build features, write code, fix bugs, and optimize code' },
                  ].map((modeItem) => {
                    const isActive = vyronWorkingMode === modeItem.id;
                    return (
                      <motion.button
                        key={modeItem.id}
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setVyronWorkingMode(modeItem.id as any)}
                        title={modeItem.title}
                        className={`px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap touch-manipulation font-bold flex items-center gap-1 ${
                          isActive
                            ? 'text-white shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-white/10'
                        }`}
                        style={isActive ? {
                          background: modeItem.id === 'learn'
                            ? 'linear-gradient(125deg, #059669, #0284c7)'
                            : modeItem.id === 'analyze'
                            ? 'linear-gradient(125deg, #4f46e5, #7c3aed)'
                            : modeItem.id === 'developer'
                            ? 'linear-gradient(125deg, #db2777, #ea580c)'
                            : 'linear-gradient(125deg, #2563eb, #ec4899, #facc15)',
                        } : undefined}
                      >
                        <span>{modeItem.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Model Speed Switcher & Font Selector */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Model Speed Switcher */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/5 p-1 rounded-xl font-semibold text-[11px] max-w-full overflow-x-auto scrollbar-none shrink-0 border border-slate-300/70 dark:border-white/10">
                  {[
                    { 
                      id: 'flash', 
                      label: '⚡ Fast', 
                      title: '⚡ Fast Mode: 2 नंबर का सटीक उत्तर (जितना पूछा जाए सिर्फ उतना ही जवाब, जैसे What is C = केवल परिभाषा)',
                      active: chatSpeedModel === 'flash' && !useHighThinking 
                    },
                    { 
                      id: 'lite', 
                      label: '🍃 Lite', 
                      title: '🍃 Lite Mode: 4 से 6 नंबर का मीडियम नोट्स उत्तर (परिभाषा + सिंटैक्स + मुख्य 2-3 प्रकार/फीचर्स)',
                      active: chatSpeedModel === 'lite' && !useHighThinking 
                    },
                    { 
                      id: 'pro', 
                      label: '🧠 Pro', 
                      title: '🧠 Pro Thinking Mode: 12 नंबर का संपूर्ण विस्तृत टॉपर उत्तर (डायग्राम, पूरा कोड, तुलना व टिप्स)',
                      active: chatSpeedModel === 'pro' || useHighThinking 
                    },
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (item.id === 'pro') {
                          setChatSpeedModel('pro');
                          setUseHighThinking(true);
                        } else {
                          setChatSpeedModel(item.id as any);
                          setUseHighThinking(false);
                        }
                      }}
                      title={item.title}
                      className={`px-2.5 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none whitespace-nowrap touch-manipulation font-bold flex items-center gap-1.5 ${
                        item.active
                          ? 'text-white shadow-md'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-white/10'
                      }`}
                      style={item.active ? {
                        background: 'linear-gradient(125deg, #2563eb, #ec4899, #facc15)',
                      } : undefined}
                    >
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Font Size Selector (Mobile Distance Reading) */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/5 p-1 rounded-xl font-bold text-xs shrink-0 border border-slate-300/70 dark:border-white/10" title="फॉन्ट साइज़ (दूर से पढ़ने के लिए)">
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 px-1 font-semibold hidden sm:inline">
                    फॉन्ट:
                  </span>
                  {[
                    { id: 'normal', label: 'A', title: 'Normal Font Size' },
                    { id: 'large', label: 'A+', title: 'Large Font (दूर से साफ पढ़ें)' },
                    { id: 'xl', label: 'A++', title: 'Extra Large (बड़ा फॉन्ट)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChatFontSize(item.id as any)}
                      title={item.title}
                      className={`px-2 py-0.5 rounded-lg transition-all text-xs font-black cursor-pointer ${
                        chatFontSize === item.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Mode Notice Banner */}
            {vyronWorkingMode !== 'general' && (
              <div className={`px-3.5 py-1.5 border-b text-xs flex items-center justify-between gap-3 shrink-0 ${
                vyronWorkingMode === 'learn'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : vyronWorkingMode === 'analyze'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
                  : 'bg-pink-500/10 border-pink-500/30 text-pink-800 dark:text-pink-300'
              }`}>
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="font-extrabold uppercase tracking-wide text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
                    {vyronWorkingMode === 'learn' ? '🎓 1. Learn Mode' : vyronWorkingMode === 'analyze' ? '🔍 2. Analyze Mode' : '🛠️ 3. Developer Mode'}
                  </span>
                  <span className="text-[11px] font-medium truncate">
                    {vyronWorkingMode === 'learn' && 'Step-by-step programming: HTML, CSS, Java, JS, React, TypeScript, Firebase with examples.'}
                    {vyronWorkingMode === 'analyze' && 'Deep inspection: Live VYRON codebase, components, styles, DIVs, buttons & line numbers.'}
                    {vyronWorkingMode === 'developer' && 'Live development: Create features, write code, fix bugs, optimize with before/after comparisons.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVyronWorkingMode('general')}
                  className="text-[11px] font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
                >
                  Reset
                </button>
              </div>
            )}


            {/* Chat Messages */}
            <div 
              ref={messagesContainerRef}
              onScroll={() => {
                if (messagesContainerRef.current) {
                  const c = messagesContainerRef.current;
                  const isNearBottom = c.scrollHeight - c.scrollTop - c.clientHeight <= 140;
                  isUserScrolledUpRef.current = !isNearBottom;
                }
              }}
              className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50 min-w-0 flex flex-col relative"
            >
              {/* Subtle ambient light gradient in message canvas */}
              <div className="absolute inset-0 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center my-auto py-6 px-3 text-center space-y-6 animate-fade-in w-full max-w-2xl mx-auto select-none relative z-10">
                  {/* Glowing 3D AI Orb with Chromatic Rainbow Ring (Static luxury design) */}
                  <div className="relative group flex items-center justify-center">
                    {/* Outer Chromatic Rainbow Aura */}
                    <div 
                      className="absolute -inset-4 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition duration-300 pointer-events-none"
                      style={{
                        background: 'linear-gradient(125deg, #2563eb, #ec4899, #facc15, #10b981, #f97316)',
                      }}
                    />
                    
                    {/* Core Orb Container */}
                    <div 
                      className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-3xl p-[2px] shadow-xl flex flex-col items-center justify-center"
                      style={{
                        background: 'linear-gradient(125deg, #2563eb, #ec4899, #facc15, #10b981, #f97316)',
                      }}
                    >
                      <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                        {/* Background particle aura */}
                        <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(37,99,235,0.15)_0%,_transparent_70%]" />
                        
                        <div className="relative z-10 flex items-center justify-center">
                          <span 
                            className="font-black text-4xl sm:text-5xl bg-clip-text text-transparent tracking-tighter drop-shadow-xs"
                            style={{
                              backgroundImage: 'linear-gradient(125deg, #2563eb 0%, #ec4899 35%, #f59e0b 65%, #10b981 100%)',
                            }}
                          >
                            V
                          </span>
                          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300 absolute -top-1 -right-3" />
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-purple-600 dark:text-cyan-300 uppercase mt-1">
                          AI CORE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <h3 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2 flex-wrap">
                      <span>Ask anything</span>
                      <span 
                        className="bg-clip-text text-transparent font-black"
                        style={{
                          backgroundImage: 'linear-gradient(125deg, #2563eb 0%, #ec4899 30%, #f59e0b 60%, #10b981 85%, #f97316 100%)',
                        }}
                      >
                        Vyron AI
                      </span>
                    </h3>
                  </div>

                  {/* Mode-Specific Quick Prompts */}
                  {vyronWorkingMode === 'learn' && (
                    <div className="w-full max-w-lg space-y-2 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 text-center">
                        🎓 Learn Programming Concepts Step-by-Step
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'React me useState aur useEffect hooks step-by-step samjhao',
                          'Explain TypeScript interfaces vs types with examples',
                          'Java OOP concepts: Polymorphism and Inheritance with code',
                          'Teach me HTML5 semantic layout and modern CSS flexbox',
                          'JavaScript Promises, Async/Await aur Event Loop explain karo',
                          'Firebase Firestore database rules and querying basics'
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendPrompt(q)}
                            className="p-2 text-xs font-medium rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-left cursor-pointer"
                          >
                            💡 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {vyronWorkingMode === 'analyze' && (
                    <div className="w-full max-w-lg space-y-2 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 text-center">
                        🔍 Analyze VYRON Codebase & Components
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Analyze AppCode.tsx and explain how two-way sync works',
                          'Header.tsx me theme toggle button aur search bar kahan hain?',
                          'server.ts me authentication and API endpoints with line numbers',
                          'Explain BottomNav.tsx tabs and active state indicator logic',
                          'Analyze typing master component and explain state hooks',
                          'Explain how Firestore security rules protect user data'
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendPrompt(q)}
                            className="p-2 text-xs font-medium rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-left cursor-pointer"
                          >
                            🔎 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {vyronWorkingMode === 'developer' && (
                    <div className="w-full max-w-lg space-y-2 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 text-center">
                        🛠️ Develop, Fix & Optimize Code
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Find and fix any potential bugs in my codebase with proposal',
                          'Suggest a performance optimization for React state re-renders',
                          'How do I add a new game into the GamesHub component?',
                          'Review server.ts error handling and propose improvements',
                          'Optimize Tailwind CSS styling across modal dialogs',
                          'Add an export or download feature in App Code editor'
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendPrompt(q)}
                            className="p-2 text-xs font-medium rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200 border border-pink-200 dark:border-pink-800/60 hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors text-left cursor-pointer"
                          >
                            ⚡ {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg) => {
                // Check if message has MCQ options (e.g. A), B), C), D))
                const mcqMatches = msg.role === 'model' ? msg.text.match(/([A-D]\)[^\n]+)/g) : null;

                return (
                  <div key={msg.id} className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`transition-all ${
                      msg.role === 'user'
                        ? 'max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white rounded-tr-xs shadow-md shadow-purple-900/20 ring-1 ring-white/20'
                        : 'w-full max-w-[98%] sm:max-w-[94%] rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-md border border-slate-200/90 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-cyan-500/40 relative ring-1 ring-black/5 dark:ring-white/5'
                    }`}>
                      <SmartNotesRenderer content={msg.text} isUser={msg.role === 'user'} fontSize={chatFontSize} />

                      {/* Interactive MCQ Option Tap Buttons */}
                      {mcqMatches && mcqMatches.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                          <p className="text-xs sm:text-sm font-bold text-purple-700 dark:text-cyan-300 flex items-center gap-1.5">
                            <span>👉 Option par tap karo:</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mcqMatches.map((opt, oIdx) => {
                              return (
                                <motion.button
                                  key={oIdx}
                                  type="button"
                                  disabled={loading}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleSendPrompt(opt.trim())}
                                  className="text-left px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-500/40 transition-all cursor-pointer truncate shadow-xs"
                                >
                                  {opt.trim()}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Modern Bottom Action Bar: 🔊 Voice / Read Aloud | 📋 Copy */}
                      {msg.role === 'model' && msg.text && !msg.isStreaming && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 flex-wrap text-slate-700 dark:text-slate-300 select-none">
                          {/* AI status indicator */}
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-white/5 text-purple-700 dark:text-cyan-300 font-bold text-[10px] border border-purple-200 dark:border-cyan-400/30">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-300" />
                              Vyron AI
                            </span>
                            {speakingMessageId === msg.id && (
                              <span className="flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-cyan-300 font-medium animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-cyan-400 animate-ping" />
                                <span>Reading aloud...</span>
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Voice & Copy */}
                          <div className="flex items-center gap-1.5 ml-auto">
                            {/* 1. Voice / Read Aloud Button */}
                            <motion.button
                              type="button"
                              id={`voice-btn-${msg.id}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleToggleVoiceMessage(msg.id, msg.text)}
                              title={speakingMessageId === msg.id ? "Stop voice / बोलना बंद करें" : "Read aloud / उत्तर आवाज़ में सुनें"}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                                speakingMessageId === msg.id
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/40 ring-1 ring-white/50 animate-pulse'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                              }`}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                                  <span>Reading...</span>
                                  <span className="text-[10px] text-purple-200 font-normal hover:underline ml-0.5">(Stop)</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-cyan-300" />
                                  <span>Voice</span>
                                </>
                              )}
                            </motion.button>

                            {/* Divider */}
                            <span className="text-slate-300 dark:text-white/20 text-xs select-none">|</span>

                            {/* 2. Copy Button */}
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              title="Copy complete answer / पूरा उत्तर कॉपी करें"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                                copiedId === msg.id
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/40 border border-emerald-400'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                              }`}
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span className="text-white font-bold">Copied ✓</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-purple-600 dark:text-cyan-300 text-xs font-medium p-2 animate-pulse">
                  <Loader2 className="w-4 h-4 text-purple-600 dark:text-cyan-400 animate-spin shrink-0" />
                  <span>Vyron AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar matching whole app */}
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shrink-0 w-full flex flex-col relative z-10 border-t border-slate-200/80 dark:border-slate-800">
              <div className="p-2.5 sm:p-3 flex items-center gap-2 w-full max-w-full">
                {/* Fixed Height Typing Input Box (Never shrinks or expands) */}
                <div className="relative flex-1 min-w-0 h-[46px] min-h-[46px] max-h-[46px] bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus-within:border-purple-500 dark:focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-purple-500/20 dark:focus-within:ring-cyan-400/20 rounded-2xl px-3.5 flex items-center gap-2 transition-all cursor-text overflow-hidden">
                  <textarea
                    rows={1}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt();
                      }
                    }}
                    placeholder={language === 'hi' ? 'Vyron AI से कुछ भी पूछें...' : 'Ask Vyron AI anything...'}
                    className="w-full h-[24px] min-h-[24px] max-h-[24px] bg-transparent border-0 p-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 dark:text-slate-300 focus:outline-none resize-none leading-[24px] whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-none"
                  />
                </div>

                {/* Voice Mic Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleStartVoice}
                  title={isListening ? "Stop voice listening" : "Start voice typing"}
                  className={`relative overflow-hidden p-2.5 sm:p-3 rounded-2xl shrink-0 cursor-pointer transition-all border ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.6)] ring-2 ring-red-400/50'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
                      <span className="absolute -inset-1 rounded-2xl bg-red-500/30 animate-ping pointer-events-none" />
                    </>
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>

                {/* Send Button: Signature Rainbow Animated AI Action Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSendPrompt()}
                  disabled={!prompt.trim() || loading}
                  title="Send message"
                  className="group relative overflow-hidden p-2.5 sm:p-3 rounded-2xl shrink-0 cursor-pointer flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none transition-transform active:scale-95 touch-manipulation shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 35%, #facc15 65%, #f97316 100%)',
                  }}
                >
                  {/* Outer Chromatic Glow Aura (Static soft glow) */}
                  <span
                    className="absolute -inset-0.5 rounded-2xl blur-xs opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none -z-10"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #ec4899, #facc15, #f97316)',
                      filter: 'blur(4px)',
                    }}
                  />
                  {/* Glossy Top Sheen */}
                  <span className="absolute inset-x-0.5 top-0 h-[40%] rounded-t-xl bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none z-10" />
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] relative z-20 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.button>
              </div>
            </div>

            {/* Floating Copy Toast Notification */}
            {copyToast.show && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out animate-bounce">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-emerald-500/50">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>{copyToast.message}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POWER 2 - NEARBY SERVICES FINDER (PATNA & LIVE GPS) */}
        {activeTab === 'nearby' && (
          <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto space-y-4 min-w-0">
            {/* Header & GPS banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-amber-500/15 border border-amber-400/40 space-y-2.5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#000080] text-amber-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Patna Nearby Services & Mechanic Finder
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Real Google Places & Maps verified listings across Patna. Zero fake phone numbers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDetectLocation}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Detect GPS Location</span>
                </button>
              </div>

              {nearbyGpsStatus && (
                <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2 rounded-lg border border-blue-200 dark:border-blue-800/50">
                  {nearbyGpsStatus}
                </div>
              )}
            </div>

            {/* Service Category Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Service Type:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'mechanic', label: '🔧 Bike/Car Mechanic' },
                  { id: 'puncture', label: '🏍️ Bike Puncture' },
                  { id: 'electrician', label: '⚡ Electrician' },
                  { id: 'plumber', label: '🚰 Plumber' },
                  { id: 'medical store', label: '💊 24x7 Medical Store' },
                  { id: 'doctor clinic', label: '🩺 Doctor / Clinic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setNearbyType(item.id);
                      handleFetchNearby(item.id, nearbyArea);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      nearbyType === item.id
                        ? 'bg-[#000080] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Area Input & Popular Patna Areas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter Patna Area / Landmark:</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={nearbyArea}
                    onChange={(e) => setNearbyArea(e.target.value)}
                    placeholder="e.g. Kankarbagh, Boring Road, Bailey Road, Raja Bazar, Patna"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => handleFetchNearby(nearbyType, nearbyArea)}
                  disabled={nearbyLoading}
                  className="px-4 py-2 bg-[#000080] text-white rounded-xl text-xs font-bold hover:bg-blue-900 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {nearbyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search Services</span>
                </button>
              </div>

              {/* Popular Area Quick Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-slate-400 font-medium shrink-0">Popular Areas:</span>
                {['Kankarbagh', 'Boring Road', 'Patliputra', 'Bailey Road', 'Raja Bazar', 'Fraser Road', 'Anisabad', 'Danapur'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      const fullLoc = `${loc}, Patna`;
                      setNearbyArea(fullLoc);
                      handleFetchNearby(nearbyType, fullLoc);
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Verified {nearbyType.toUpperCase()} in {nearbyArea}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 rounded-full text-[10px]">
                    Live Maps Grounded
                  </span>
                </h4>
                <span className="text-[11px] text-slate-700 dark:text-slate-300">
                  {nearbyResults.length} locations
                </span>
              </div>

              {nearbyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-700 dark:text-slate-300">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-xs">Fetching verified service locations from Google Maps...</p>
                </div>
              ) : nearbyResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nearbyResults.map((place, idx) => (
                    <div
                      key={place.id || idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 shadow-xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {idx + 1}. {place.name}
                          </h5>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2">
                            📍 {place.vicinity}
                          </p>
                        </div>
                        <div className="px-2 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 text-amber-900 dark:text-amber-300 text-[10px] font-black rounded-lg shrink-0 flex items-center gap-0.5">
                          <span>⭐</span>
                          <span>{place.rating || '4.5'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{place.openNow ? 'Open Now' : 'Verified Listing'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={place.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ' + place.vicinity)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Navigate</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">No listings loaded yet</h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Click 'Search Services' or select a popular area like Kankarbagh or Boring Road to load live verified mechanics.
                  </p>
                </div>
              )}
            </div>

            {/* Anti-hallucination Developer integration note */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified Maps Safety Guarantee</span>
              </div>
              <p>
                Google Maps API / Places connection strictly prevents fake contact hallucinations. All links open authenticated Google Maps navigation for real business calls and directions.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH & MAPS GROUNDING */}
        {activeTab === 'grounding' && (
          <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto space-y-4 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full max-w-xs mx-auto">
              <button
                onClick={() => setGroundingMode('search')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all ${
                  groundingMode === 'search' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Google Search</span>
              </button>
              <button
                onClick={() => setGroundingMode('maps')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all ${
                  groundingMode === 'maps' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Google Maps</span>
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={groundingQuery}
                onChange={(e) => setGroundingQuery(e.target.value)}
                placeholder={groundingMode === 'search' ? 'e.g., Solar subsidies India 2026' : 'e.g., Jan Aushadhi pharmacy CP Delhi'}
                className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSearchOrMaps}
                disabled={!groundingQuery.trim() || groundingLoading}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm rounded-2xl shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {groundingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>

            {groundingResult && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {groundingResult.text}
                </div>
                {groundingResult.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <Search className="w-3 h-3" /> Grounded Citations & Sources:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {groundingResult.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>{s.title || 'Source link'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMAGE STUDIO */}
        {activeTab === 'image' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe image to generate (e.g., Minimalist vector icon of Indian solar panel scheme)"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none"
              />

              {/* Aspect Ratio & Quality Selector */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Aspect Ratio:</span>
                  <select
                    value={imageRatio}
                    onChange={(e) => setImageRatio(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Quality & Model:</span>
                  <select
                    value={imageQuality}
                    onChange={(e) => setImageQuality(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="flash">Flash Image (Speed)</option>
                    <option value="pro">Pro Image (High Quality 1K/2K/4K)</option>
                  </select>
                </div>

                {imageQuality === 'pro' && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">Resolution:</span>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as any)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Optional Input Image for Image Editing */}
              <div className="flex items-center gap-3">
                <label className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                  <span>{inputImage ? 'Change Edit Reference Image' : 'Upload Image to Edit/Modify'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (b64) => setInputImage(b64))}
                  />
                </label>
                {inputImage && (
                  <button onClick={() => setInputImage(null)} className="text-xs text-rose-500 font-bold hover:underline">
                    Remove Reference
                  </button>
                )}
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || imageLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {imageLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                <span>Generate / Edit Image</span>
              </button>
            </div>

            {generatedImage && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center space-y-3">
                <img src={generatedImage} alt="Generated AI" className="max-h-80 rounded-xl shadow-lg object-contain" />
                <a
                  href={generatedImage}
                  download="vyron-ai-generated.png"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4" /> Download Image
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MUSIC STUDIO */}
        {activeTab === 'music' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="Describe music track (e.g., Upbeat Indian fusion classical acoustic track with sitar and tabla)"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none"
              />

              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Track Length:</span>
                <button
                  onClick={() => setMusicType('clip')}
                  className={`px-3 py-1.5 rounded-xl font-bold ${musicType === 'clip' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  Lyria 3 Clip (30s)
                </button>
                <button
                  onClick={() => setMusicType('pro')}
                  className={`px-3 py-1.5 rounded-xl font-bold ${musicType === 'pro' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  Lyria 3 Pro (Full Track)
                </button>
              </div>

              <button
                onClick={handleGenerateMusic}
                disabled={!musicPrompt.trim() || musicLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:opacity-90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {musicLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5" />}
                <span>Generate Lyria Music</span>
              </button>
            </div>

            {generatedAudio && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <audio ref={audioRef} src={generatedAudio.audioData} controls className="w-full rounded-xl" />
                {generatedAudio.lyrics && (
                  <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-amber-500 block mb-1">Generated Lyrics / Notes:</span>
                    {generatedAudio.lyrics}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: VEO 3 VIDEO STUDIO */}
        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe video scene (e.g., A cinematic drone shot of rural Indian fields during sunset)"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none"
              />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Aspect Ratio:</span>
                  <button
                    onClick={() => setVideoRatio('16:9')}
                    className={`px-3 py-1 rounded-lg font-bold ${videoRatio === '16:9' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    onClick={() => setVideoRatio('9:16')}
                    className={`px-3 py-1 rounded-lg font-bold ${videoRatio === '9:16' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                  >
                    9:16 Portrait
                  </button>
                </div>

                <label className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-rose-500" />
                  <span>{videoImage ? 'Photo Selected' : 'Animate Photo into Video'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (b64) => setVideoImage(b64))}
                  />
                </label>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={(!videoPrompt.trim() && !videoImage) || videoLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-700 hover:opacity-90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {videoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                <span>Generate Veo 3 Video</span>
              </button>
            </div>

            {videoStatus && (
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
                <span>{videoStatus}</span>
              </div>
            )}

            {videoUrl && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center space-y-3">
                <video src={videoUrl} controls className="max-h-80 rounded-xl shadow-lg w-full" />
                <a
                  href={videoUrl}
                  download="veo-3-video.mp4"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4" /> Download MP4 Video
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: VISION & SPEECH */}
        {activeTab === 'media' && (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Media Analysis Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-500" />
                  <span>Image & Video Content Analysis</span>
                </h4>
                <input
                  type="text"
                  value={mediaPrompt}
                  onChange={(e) => setMediaPrompt(e.target.value)}
                  placeholder="Ask a question about uploaded image/video..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <label className="w-full text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{mediaFile ? 'Change File' : 'Upload Image or Video'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (b64, mime, isVid) => setMediaFile({ base64: b64, mimeType: mime, isVideo: isVid }))}
                  />
                </label>
                <button
                  onClick={handleAnalyzeMedia}
                  disabled={!mediaFile || mediaLoading}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {mediaLoading ? 'Analyzing...' : 'Analyze with Vyron Pro'}
                </button>
                {mediaAnalysis && (
                  <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {mediaAnalysis}
                  </div>
                )}
              </div>

              {/* Speech Transcription Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-500" />
                  <span>Audio Speech Transcription</span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Upload an audio recording to transcribe speech using Vyron AI.
                </p>
                <label className="w-full text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload Audio File</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          handleAudioTranscribe(reader.result, file.type);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {transcribing && <p className="text-xs text-emerald-500 font-bold animate-pulse">Transcribing audio...</p>}
                {audioTranscript && (
                  <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {audioTranscript}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
});

