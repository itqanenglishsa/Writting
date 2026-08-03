/**
 * Speech synthesis normalization and audio playback utilities for Itqan English.
 */

/**
 * Normalizes English text specifically for Web Speech Synthesis engines.
 * Converts honorific abbreviations ("Mr.", "Mr", "Mrs.", "Mrs", "Ms.", "Ms")
 * to their full phonetic word equivalents ("Mister", "Missus", "Miss") before sending to TTS.
 * This ensures clean, natural pronunciation across all browsers and operating systems.
 */
export function normalizeTextForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Replace Mrs. or Mrs (case-insensitive, standalone honorific)
    .replace(/\bMrs(?:\.|\b)/gi, (match) => {
      if (match === match.toLowerCase()) return 'missus';
      if (match === match.toUpperCase()) return 'MISSUS';
      return 'Missus';
    })
    // Replace Mr. or Mr (case-insensitive, standalone honorific)
    .replace(/\bMr(?:\.|\b)/gi, (match) => {
      if (match === match.toLowerCase()) return 'mister';
      if (match === match.toUpperCase()) return 'MISTER';
      return 'Mister';
    })
    // Replace Ms. or Ms (case-insensitive, standalone honorific)
    .replace(/\bMs(?:\.|\b)/gi, (match) => {
      if (match === match.toLowerCase()) return 'miss';
      if (match === match.toUpperCase()) return 'MISS';
      return 'Miss';
    });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Universal speech synthesis helper that works reliably across browsers and devices.
 * Automatically normalizes abbreviations (Mr., Mrs., Ms.) before triggering SpeechSynthesis.
 */
export function speakText(text: string, options: SpeakOptions = {}): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    // Cancel any current utterance to prevent queue sticking or overlaps
    window.speechSynthesis.cancel();

    const normalizedText = normalizeTextForSpeech(text);
    if (!normalizedText.trim()) return false;

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate !== undefined ? options.rate : 0.85;
    if (options.pitch !== undefined) utterance.pitch = options.pitch;
    if (options.volume !== undefined) utterance.volume = options.volume;

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options.onError) {
      utterance.onerror = options.onError;
    }

    // Workaround for Safari/Chrome speech engine pausing state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return false;
  }
}

/**
 * Safely cancels any active speech synthesis playback.
 */
export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
