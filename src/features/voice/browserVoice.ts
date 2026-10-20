import { VOICE_LANG, VOICE_TIMING } from './voice.constants';
import type { VoiceIO, VoiceRecognitionError, VoiceSpeakOptions } from './voice.types';

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechWindow = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};

const RESTART_DELAY_MS = 150;
const SPEECH_RATE = 1.05;
const PREFERRED_VOICE_PATTERN = /natural|neural|google|luciana|francisca/i;
const IGNORED_RECOGNITION_ERRORS: ReadonlySet<string> = new Set(['no-speech', 'aborted']);
const BLOCKED_RECOGNITION_ERRORS: ReadonlySet<string> = new Set([
  'not-allowed',
  'service-not-allowed',
  'audio-capture',
]);

function resolveRecognition(): BrowserSpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function mapRecognitionError(error: string): VoiceRecognitionError {
  if (BLOCKED_RECOGNITION_ERRORS.has(error)) return 'not-allowed';
  if (error === 'network') return 'network';
  return 'unknown';
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const brazilian = voices.filter((voice) => voice.lang.replace('_', '-') === VOICE_LANG);
  const pool = brazilian.length > 0 ? brazilian : voices.filter((voice) => voice.lang.startsWith('pt'));
  return pool.find((voice) => PREFERRED_VOICE_PATTERN.test(voice.name)) ?? pool[0] ?? null;
}

function wordEndAt(text: string, charIndex: number): number {
  const nextSpace = text.slice(charIndex).search(/\s/);
  return nextSpace === -1 ? text.length : charIndex + nextSpace;
}

export function speakWithTimer(
  text: string,
  { signal, onProgress }: VoiceSpeakOptions,
  msPerChar: number = VOICE_TIMING.fallbackMsPerChar,
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted || msPerChar <= 0) {
      onProgress(text.length);
      resolve();
      return;
    }
    let revealed = 0;
    const timer = setInterval(() => {
      revealed = wordEndAt(text, Math.min(revealed + 1, text.length));
      onProgress(revealed);
      if (revealed >= text.length) finish();
    }, msPerChar * 4);
    function finish() {
      clearInterval(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    }
    signal.addEventListener('abort', finish);
  });
}

function speakWithSynthesis(
  synth: SpeechSynthesis,
  text: string,
  { signal, onProgress }: VoiceSpeakOptions,
): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LANG;
    utterance.rate = SPEECH_RATE;
    utterance.voice = pickVoice(synth);

    const safetyTimer = setTimeout(finish, text.length * VOICE_TIMING.fallbackMsPerChar * 3 + 4000);
    function finish() {
      clearTimeout(safetyTimer);
      signal.removeEventListener('abort', abort);
      onProgress(text.length);
      resolve();
    }
    function abort() {
      synth.cancel();
      finish();
    }

    utterance.onboundary = (event) => {
      if (event.name && event.name !== 'word') return;
      onProgress(wordEndAt(text, event.charIndex));
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    signal.addEventListener('abort', abort);
    synth.speak(utterance);
  });
}

export function createBrowserVoiceIO(): VoiceIO {
  const Recognition = resolveRecognition();
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  synth?.getVoices();

  return {
    recognitionSupported: Boolean(Recognition),
    listen: (handlers) => {
      if (!Recognition) {
        handlers.onError('unsupported');
        return () => undefined;
      }

      let active = true;
      let recognition: BrowserSpeechRecognition | null = null;
      let restartTimer: ReturnType<typeof setTimeout> | undefined;

      const stop = () => {
        active = false;
        clearTimeout(restartTimer);
        recognition?.abort();
        recognition = null;
      };

      const startRecognition = () => {
        if (!active) return;
        const current = new Recognition();
        recognition = current;
        current.lang = VOICE_LANG;
        current.continuous = true;
        current.interimResults = true;
        current.maxAlternatives = 1;

        current.onresult = (event) => {
          let finalText = '';
          let interimText = '';
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result[0]?.transcript ?? '';
            if (result.isFinal) finalText += transcript;
            else interimText += transcript;
          }
          if (finalText.trim()) {
            stop();
            handlers.onFinal(finalText.trim());
            return;
          }
          if (interimText.trim()) handlers.onInterim(interimText.trim());
        };
        current.onerror = (event) => {
          if (IGNORED_RECOGNITION_ERRORS.has(event.error)) return;
          stop();
          handlers.onError(mapRecognitionError(event.error));
        };
        current.onend = () => {
          if (!active || recognition !== current) return;
          restartTimer = setTimeout(startRecognition, RESTART_DELAY_MS);
        };
        current.start();
      };

      startRecognition();
      return stop;
    },
    speak: (text, options) =>
      synth ? speakWithSynthesis(synth, text, options) : speakWithTimer(text, options),
    cancelSpeech: () => synth?.cancel(),
  };
}
