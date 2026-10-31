// Voice Speech Synthesis & Recognition Helper for BharatJugaad powered by Vyron AI
// Upgraded: Production-grade Indian Female Teacher / Tutor Voice Engine (hi-IN & en-IN)

let currentSpeechSessionId = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoiceListenerAttached = false;
let activeUtteranceRef: SpeechSynthesisUtterance | null = null;

/**
 * Ensures voices from the Web Speech API are loaded asynchronously.
 * Browsers (especially Chromium & Safari) populate getVoices() asynchronously.
 */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    try {
      const existing = window.speechSynthesis.getVoices();
      if (existing && existing.length > 0) {
        cachedVoices = existing;
        resolve(existing);
        return;
      }
    } catch {
      // Continue to event listener
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const onVoicesChanged = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          cachedVoices = voices;
          if (timeoutId) clearTimeout(timeoutId);
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(voices);
          return;
        }
      } catch {
        // Fallback below
      }
    };

    if (!isVoiceListenerAttached) {
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      isVoiceListenerAttached = true;
    }

    // Safety timeout: resolve with whatever voices are available after 350ms
    timeoutId = setTimeout(() => {
      try {
        const finalVoices = window.speechSynthesis.getVoices() || [];
        if (finalVoices.length > 0) cachedVoices = finalVoices;
        resolve(cachedVoices);
      } catch {
        resolve([]);
      }
    }, 350);
  });
}

// Initial warm-up on module load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  ensureVoicesLoaded();
}

/**
 * Intelligently cleans and formats raw AI text for natural explanation-style speech.
 * Removes markdown, code blocks, emojis, symbols, and creates natural punctuation pauses.
 */
export function prepareTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Replace large code blocks with a brief natural note
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const isHindi = /[\u0900-\u097F]/.test(text);
    return isHindi ? ' । यहाँ पर प्रोग्राम कोड दिया गया है । ' : ' . Here is the program code snippet . ';
  });

  // 2. Clean inline code ticks
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Clean markdown headers and ensure natural pause after header
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');

  // 4. Convert bullet points and list markers into natural sentence pauses
  text = text.replace(/^[\*\-\+•]\s+/gm, ' ');
  text = text.replace(/^\d+\.\s+/gm, (match) => {
    return `${match.trim()} `;
  });

  // 5. Clean markdown bold, italic, strikethrough
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 6. Clean blockquotes
  text = text.replace(/^>\s+/gm, ' ');

  // 7. Clean URLs and Markdown links [Text](url) -> Text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, 'link');

  // 8. Pronounce Indian currency & common mathematical symbols naturally
  text = text.replace(/₹\s*(\d+)/g, '$1 rupees ');
  text = text.replace(/₹/g, ' rupees ');
  text = text.replace(/Rs\.?\s*(\d+)/gi, '$1 rupees ');
  text = text.replace(/(\d+)%/g, '$1 percent');
  text = text.replace(/&/g, ' and ');

  // 9. Clean all emojis and decorative symbols so TTS doesn't read symbol names
  text = text.replace(/[\u{1F300}-\u{1FAD6}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '');

  // 10. Clean leftover brackets, arrows, divider lines, and pipe characters
  text = text.replace(/[-=_]{3,}/g, ' ');
  text = text.replace(/[|~^\\<>{}]/g, ' ');

  // 11. Normalize quotation marks and dashes into natural pauses
  text = text.replace(/["“”'‘’]/g, '');
  text = text.replace(/\s*[-–—]\s*/g, ', ');

  // 12. Normalize multiple punctuation and spacing
  text = text.replace(/\.{2,}/g, '.');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Splits cleaned speech text into natural conversational chunks (breath groups).
 * This creates teacher-like pauses and prevents browser TTS cutoff bugs on long text.
 */
function splitIntoNaturalChunks(text: string): string[] {
  if (!text) return [];

  // Split on sentence boundaries: Devanagari danda (।), period, question mark, exclamation, or newline
  const sentenceRegex = /([^।\.\?!;\n]+[।\.\?!;\n]*)/g;
  const rawSentences = text.match(sentenceRegex) || [text];

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // Keep chunk size comfortable for natural delivery (~120-160 chars)
    if ((currentChunk + ' ' + trimmed).length < 160) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);

      // If a single sentence is long, split by comma or conjunction
      if (trimmed.length > 200) {
        const subParts = trimmed.split(/,\s+/);
        let subChunk = '';
        for (const part of subParts) {
          if ((subChunk + ', ' + part).length < 150) {
            subChunk = subChunk ? `${subChunk}, ${part}` : part;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = part;
          }
        }
        if (subChunk) currentChunk = subChunk;
        else currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Detects if the text has Hindi (Devanagari) or Hinglish content.
 */
export function detectSpeechLanguage(text: string): { lang: 'hi' | 'en'; isHinglish: boolean } {
  // If Devanagari script is present
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) {
    return { lang: 'hi', isHinglish: false };
  }

  // Check for common Romanized Hindi / Hinglish keywords
  const hinglishWords = /\b(hai|hain|kya|kyu|kaise|hota|hoti|hote|karna|karein|samjhein|samjho|yeh|woh|aur|lekin|chahiye|pehle|baad|mein|aap|tum|hum|apna|apni|bhi|toh|nahi|sakte|sakta|saktee)\b/i;
  const isHinglish = hinglishWords.test(text);

  return { lang: 'en', isHinglish };
}

/**
 * Helper to test if a voice name or URI matches known Indian Female Voice identifiers.
 */
function isIndianFemaleVoice(v: SpeechSynthesisVoice): boolean {
  const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();

  // Explicit female names used across Microsoft, Google, Apple, Android, Nuance
  const knownIndianFemaleKeywords = [
    'heera',      // Microsoft Heera (hi-IN)
    'swara',      // Microsoft Swara (hi-IN)
    'kalpana',    // Microsoft Kalpana (hi-IN)
    'geeta',      // Geeta (hi-IN)
    'neerja',     // Microsoft Neerja (en-IN)
    'priya',      // Priya (en-IN)
    'lekha',      // Apple Lekha (hi-IN female)
    'veena',      // Apple Veena (en-IN female)
    'ananya',     // Ananya (hi-IN / en-IN)
    'kavya',      // Kavya (hi-IN / en-IN)
    'aditi',      // Amazon / TTS Aditi
    'shreya',     // Shreya
    'google हिन्दी', // Google Hindi on Chrome/Android (female)
    'google hindi',
    'google indian english', // Google Indian English on Chrome/Android (female)
    'google english (india)',
  ];

  if (knownIndianFemaleKeywords.some((k) => name.includes(k))) {
    return true;
  }

  // Android TTS naming: e.g. "hi-in-x-hie#female_1-local", "en-in-x-enc#female_1"
  if (name.includes('female') && (name.includes('in') || name.includes('india'))) {
    return true;
  }

  return false;
}

/**
 * Helper to test if a voice is explicitly male, to avoid picking male voices
 * when female alternatives or generic neutral fallbacks are desired.
 */
function isExplicitlyMaleVoice(v: SpeechSynthesisVoice): boolean {
  const name = (v.name + ' ' + (v.voiceURI || '')).toLowerCase();
  const maleKeywords = [
    'male',
    'david',
    'mark',
    'george',
    'alex',
    'fred',
    'rishi',
    'hemant',
    'madhav',
    'pradeep',
    'ravi',
    'prabhat',
    'guy',
    'tom',
    'daniel',
  ];
  return maleKeywords.some((k) => name.includes(k)) && !name.includes('female');
}

/**
 * Selects the highest quality Indian Female Voice available in the browser.
 * Prioritizes natural Indian female teachers/tutors for Hindi (hi-IN),
 * Indian English (en-IN), and Hinglish.
 */
export function getIndianFemaleVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'hi' | 'en' = 'en',
  isHinglish = false
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const isHindiMatch = (v: SpeechSynthesisVoice) => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    return l.startsWith('hi') || l.includes('hi-in') || l.includes('hi_in') || n.includes('hindi') || n.includes('हिन्दी');
  };

  const isIndianEnglishMatch = (v: SpeechSynthesisVoice) => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    return (
      l === 'en-in' ||
      l === 'en_in' ||
      l.startsWith('en-in') ||
      n.includes('india') ||
      n.includes('indian')
    );
  };

  // ==========================================
  // CASE 1: HINDI REQUESTED ('hi' / Devanagari)
  // ==========================================
  if (lang === 'hi') {
    // 1. Known Indian Hindi Female Voices (Heera, Swara, Google हिन्दी, Lekha, etc.)
    const hiFemale = voices.find((v) => isHindiMatch(v) && isIndianFemaleVoice(v));
    if (hiFemale) {
      return hiFemale;
    }

    // 2. Any Hindi voice that is not explicitly marked male
    const hiNonMale = voices.find((v) => isHindiMatch(v) && !isExplicitlyMaleVoice(v));
    if (hiNonMale) {
      return hiNonMale;
    }

    // 3. Any Hindi voice at all
    const anyHi = voices.find((v) => isHindiMatch(v));
    if (anyHi) {
      return anyHi;
    }

    // 4. Fallback: Indian English Female Voice (handles Indian accent well)
    const enInFemale = voices.find((v) => isIndianEnglishMatch(v) && isIndianFemaleVoice(v));
    if (enInFemale) {
      return enInFemale;
    }

    // 5. Any Indian English voice
    const anyEnIn = voices.find((v) => isIndianEnglishMatch(v) && !isExplicitlyMaleVoice(v));
    if (anyEnIn) {
      return anyEnIn;
    }
  }

  // ==========================================
  // CASE 2: ENGLISH OR HINGLISH ('en')
  // ==========================================
  // 1. Known Indian English Female Voices (Neerja, Priya, Veena, Google Indian English, etc.)
  const enInFemale = voices.find((v) => isIndianEnglishMatch(v) && isIndianFemaleVoice(v));
  if (enInFemale) {
    return enInFemale;
  }

  // 2. Any Indian English voice that is not explicitly male
  const enInNonMale = voices.find((v) => isIndianEnglishMatch(v) && !isExplicitlyMaleVoice(v));
  if (enInNonMale) {
    return enInNonMale;
  }

  // 3. Any Indian English voice
  const anyEnIn = voices.find((v) => isIndianEnglishMatch(v));
  if (anyEnIn) {
    return anyEnIn;
  }

  // 4. If Hinglish and no en-IN, try Hindi female voice (handles romanized Hindi smoothly)
  if (isHinglish) {
    const hiFemale = voices.find((v) => isHindiMatch(v) && isIndianFemaleVoice(v));
    if (hiFemale) {
      return hiFemale;
    }
  }

  // 5. High-quality natural English female voice (e.g. en-GB / en-US female with friendly tone)
  const generalFemaleEn = voices.find(
    (v) =>
      (v.lang.startsWith('en') || (v.lang || '').toLowerCase().startsWith('en')) &&
      !isExplicitlyMaleVoice(v) &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('jenny'))
  );
  if (generalFemaleEn) {
    return generalFemaleEn;
  }

  // 6. Any English voice not explicitly male
  const anyEn = voices.find((v) => v.lang.startsWith('en') && !isExplicitlyMaleVoice(v));
  if (anyEn) {
    return anyEn;
  }

  return voices[0] || null;
}

/**
 * Main Vyron AI Speech Synthesis function.
 * Reads out responses with an Indian female teacher/tutor cadence,
 * natural sentence pauses, and smart Hinglish/Hindi/English handling.
 */
export async function speakText(text: string, lang: 'en' | 'hi' = 'en'): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Vyron AI Voice] Speech synthesis is not supported in this browser.');
    return;
  }

  // Stop any previous speech synthesis immediately
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    console.warn('[Vyron AI Voice] Cancel error:', e);
  }

  const sessionId = ++currentSpeechSessionId;

  // Intelligently clean text for natural spoken explanation
  const cleanFullText = prepareTextForSpeech(text);
  if (!cleanFullText.trim()) {
    return;
  }

  // Ensure browser voices have loaded asynchronously
  const voices = await ensureVoicesLoaded();

  // Detect language from text content:
  // If Devanagari script is present, language MUST be 'hi' (hi-IN)
  // If Latin script (English or Hinglish), language MUST be 'en' (en-IN)
  const detected = detectSpeechLanguage(cleanFullText);
  const targetLang = /[\u0900-\u097F]/.test(cleanFullText) ? 'hi' : detected.lang;
  const isHinglish = detected.isHinglish;

  // Pick best Indian female voice
  const selectedVoice = getIndianFemaleVoice(voices, targetLang, isHinglish);

  // Split into conversational breath groups / sentence chunks
  const chunks = splitIntoNaturalChunks(cleanFullText);
  if (chunks.length === 0) {
    return;
  }

  return new Promise((resolve) => {
    let chunkIndex = 0;

    const speakNextChunk = () => {
      // Abort if another voice session was started
      if (sessionId !== currentSpeechSessionId) {
        activeUtteranceRef = null;
        resolve();
        return;
      }

      if (chunkIndex >= chunks.length) {
        activeUtteranceRef = null;
        resolve();
        return;
      }

      const chunk = chunks[chunkIndex++];
      const utterance = new SpeechSynthesisUtterance(chunk);

      // Keep strong reference to prevent garbage-collection cutoff in Chromium
      activeUtteranceRef = utterance;

      // Ensure voice and language match strictly
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        // BCP-47 language tag should match the selected voice
        utterance.lang = selectedVoice.lang || (targetLang === 'hi' ? 'hi-IN' : 'en-IN');
      } else {
        // Explicit fallback BCP-47 tag to request Indian speech from engine
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-IN';
      }

      // Friendly teacher/tutor cadence:
      // Rate ~0.94 is calm and articulate, not rushed or robotic
      utterance.rate = targetLang === 'hi' ? 0.93 : 0.95;

      // Pitch 1.05 - 1.07: Warm, approachable, pleasant Indian female tone
      utterance.pitch = 1.06;

      utterance.onend = () => {
        if (sessionId !== currentSpeechSessionId) {
          activeUtteranceRef = null;
          resolve();
          return;
        }
        // Subtle natural pause (160ms) between sentences/chunks
        setTimeout(speakNextChunk, 160);
      };

      utterance.onerror = (event: any) => {
        // 'interrupted' or 'canceled' happens naturally when user clicks stop
        if (sessionId !== currentSpeechSessionId || event?.error === 'interrupted' || event?.error === 'canceled') {
          activeUtteranceRef = null;
          resolve();
          return;
        }
        console.warn('[Vyron AI Voice] Utterance warning:', event?.error || event);
        // Continue to next chunk gracefully
        setTimeout(speakNextChunk, 120);
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Vyron AI Voice] speak() exception:', err);
        activeUtteranceRef = null;
        resolve();
      }
    };

    speakNextChunk();
  });
}

/**
 * Stops any currently active speech synthesis and cancels chunk queue.
 */
export function stopSpeech(): void {
  currentSpeechSessionId++;
  activeUtteranceRef = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('[Vyron AI Voice] stopSpeech error:', e);
    }
  }
}

/**
 * Speech-to-text listener for Vyron AI voice input.
 */
export class VoiceListener {
  private recognition: any = null;
  public isListening = false;

  start(onResult: (text: string) => void, onError?: (err: string) => void, lang: 'en' | 'hi' = 'en') {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          this.isListening = false;
          onResult(transcript);
        }
      };

      rec.onerror = (event: any) => {
        this.isListening = false;
        const err = event.error || 'Voice input error';
        if (err !== 'no-speech' && err !== 'aborted') {
          if (onError) onError(err);
        }
      };

      rec.onend = () => {
        this.isListening = false;
      };

      this.recognition = rec;
      this.isListening = true;
      rec.start();
    } catch (err: any) {
      this.isListening = false;
      if (onError) onError(err.message || 'Failed to start microphone');
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        try {
          this.recognition.abort();
        } catch {}
      }
      this.isListening = false;
    }
  }
}
