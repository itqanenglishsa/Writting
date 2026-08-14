/**
 * Normalizes English text before sending it to SpeechSynthesis.
 * Specifically converts abbreviations/honorifics (e.g., Mr., Mr, Mrs., Mrs, Ms., Ms)
 * to their full phonetically pronounceable words (Mister, Missus, Miss)
 * regardless of whether they have a trailing dot or not, preserving letter casing.
 */
export function normalizeTextForSpeech(text: string): string {
  if (!text) return '';
  let processed = text;

  // 1. Replace Mrs. / Mrs
  // Handle Mrs. when directly followed by letters without space e.g. Mrs.Brown -> Missus Brown
  processed = processed.replace(/\bMrs\.(?=[a-zA-Z])/gi, 'Missus ');
  // Handle Mrs. / Mrs as word
  processed = processed.replace(/\bMrs\.?(?=\s|$|[^a-zA-Z0-9])/gi, (match) => {
    if (match === 'MRS.' || match === 'MRS') return 'MISSUS';
    if (match === 'mrs.' || match === 'mrs') return 'missus';
    return 'Missus';
  });

  // 2. Replace Mr. / Mr
  // Handle Mr. when directly followed by letters without space e.g. Mr.Smith -> Mister Smith
  processed = processed.replace(/\bMr\.(?=[a-zA-Z])/gi, 'Mister ');
  // Handle Mr. / Mr as word
  processed = processed.replace(/\bMr\.?(?=\s|$|[^a-zA-Z0-9])/gi, (match) => {
    if (match === 'MR.' || match === 'MR') return 'MISTER';
    if (match === 'mr.' || match === 'mr') return 'mister';
    return 'Mister';
  });

  // 3. Replace Ms. / Ms
  // Handle Ms. when directly followed by letters without space e.g. Ms.Lee -> Miss Lee
  processed = processed.replace(/\bMs\.(?=[a-zA-Z])/gi, 'Miss ');
  // Handle Ms. / Ms as word
  processed = processed.replace(/\bMs\.?(?=\s|$|[^a-zA-Z0-9])/gi, (match) => {
    if (match === 'MS.' || match === 'MS') return 'MISS';
    if (match === 'ms.' || match === 'ms') return 'miss';
    return 'Miss';
  });

  return processed;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Universal speech synthesis helper for cross-browser / cross-device compatibility.
 */
export function speakText(text: string, options: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const { rate = 0.85, pitch = 1.0, lang = 'en-US', onEnd, onError } = options;

  try {
    // 1. Cancel any active speech synthesis to prevent queue buildup or overlapping
    window.speechSynthesis.cancel();

    // 2. Normalize text (convert Mr. -> Mister, Mrs. -> Missus, Ms. -> Miss, etc.)
    const normalizedText = normalizeTextForSpeech(text);

    // 3. Create Utterance
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // 4. Try to assign an English voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice =
        voices.find((v) => v.lang === 'en-US' || v.lang === 'en_US') ||
        voices.find((v) => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    // 5. Resume speech synthesis if paused (common Safari/Chrome mobile issue)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 6. Speak!
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onError) onError(err);
  }
}
