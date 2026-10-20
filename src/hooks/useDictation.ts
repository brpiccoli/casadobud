import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DICTATION_LANGUAGE,
  DICTATION_SAMPLE_INTERVAL_MS,
  DICTATION_STOP_TIMEOUT_MS,
  DICTATION_WAVEFORM_SLOTS,
} from '@/features/chat/chat.constants';
import type {
  DictationLevel,
  DictationStartResult,
  DictationStatus,
} from '@/features/chat/chat.types';
import { appendTranscript } from '@/features/chat/chat.utils';
import {
  computeAudioLevel,
  createEmptyLevels,
  pushDictationLevel,
} from '@/features/chat/dictation.utils';
import type { SpeechRecognitionConstructor, SpeechRecognitionLike } from '@/types/speech.types';

const PERMISSION_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);

interface DictationResources {
  recognition: SpeechRecognitionLike;
  stream: MediaStream;
  audioContext: AudioContext;
  analyser: AnalyserNode;
  samples: Uint8Array<ArrayBuffer>;
  frameId: number;
  startedAt: number;
  lastSampleAt: number;
  finalText: string;
  interimText: string;
  stopping: boolean;
  onEnded: (() => void) | null;
}

export interface UseDictationOptions {
  onInterrupted?: () => void;
}

function resolveRecognition(): SpeechRecognitionConstructor | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isDictationSupported(): boolean {
  return Boolean(resolveRecognition() && navigator.mediaDevices?.getUserMedia);
}

export function useDictation({ onInterrupted }: UseDictationOptions = {}) {
  const [status, setStatus] = useState<DictationStatus>('idle');
  const [levels, setLevels] = useState<DictationLevel[]>(() =>
    createEmptyLevels(DICTATION_WAVEFORM_SLOTS),
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const resourcesRef = useRef<DictationResources | null>(null);
  const onInterruptedRef = useRef(onInterrupted);

  useEffect(() => {
    onInterruptedRef.current = onInterrupted;
  }, [onInterrupted]);

  const release = useCallback(() => {
    const current = resourcesRef.current;
    if (!current) return;
    resourcesRef.current = null;
    cancelAnimationFrame(current.frameId);
    current.recognition.onresult = null;
    current.recognition.onerror = null;
    current.recognition.onend = null;
    current.stream.getTracks().forEach((track) => track.stop());
    void current.audioContext.close();
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setLevels(createEmptyLevels(DICTATION_WAVEFORM_SLOTS));
    setElapsedMs(0);
  }, []);

  const start = useCallback(async (): Promise<DictationStartResult> => {
    if (resourcesRef.current) return 'started';
    const Recognition = resolveRecognition();
    if (!Recognition || !navigator.mediaDevices?.getUserMedia) return 'unsupported';

    setStatus('starting');
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus('idle');
      return 'denied';
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    const recognition = new Recognition();
    recognition.lang = DICTATION_LANGUAGE;
    recognition.continuous = true;
    recognition.interimResults = true;

    const now = performance.now();
    const current: DictationResources = {
      recognition,
      stream,
      audioContext,
      analyser,
      samples: new Uint8Array(analyser.fftSize),
      frameId: 0,
      startedAt: now,
      lastSampleAt: now,
      finalText: '',
      interimText: '',
      stopping: false,
      onEnded: null,
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) current.finalText = appendTranscript(current.finalText, transcript);
        else interim = appendTranscript(interim, transcript);
      }
      current.interimText = interim;
    };

    recognition.onerror = (event) => {
      if (!PERMISSION_ERRORS.has(event.error)) return;
      current.stopping = true;
      release();
      reset();
      onInterruptedRef.current?.();
    };

    recognition.onend = () => {
      if (current.stopping) {
        current.onEnded?.();
        return;
      }
      try {
        recognition.start();
      } catch {
        current.onEnded?.();
      }
    };

    const loop = (frameTime: number) => {
      if (resourcesRef.current !== current || current.stopping) return;
      if (frameTime - current.lastSampleAt >= DICTATION_SAMPLE_INTERVAL_MS) {
        current.analyser.getByteTimeDomainData(current.samples);
        const level = computeAudioLevel(current.samples);
        current.lastSampleAt = frameTime;
        setLevels((previous) => pushDictationLevel(previous, level));
        setElapsedMs(frameTime - current.startedAt);
      }
      current.frameId = requestAnimationFrame(loop);
    };

    resourcesRef.current = current;
    recognition.start();
    current.frameId = requestAnimationFrame(loop);
    setStatus('recording');
    return 'started';
  }, [release, reset]);

  const stop = useCallback(async (): Promise<string> => {
    const current = resourcesRef.current;
    if (!current) return '';

    setStatus('transcribing');
    current.stopping = true;
    cancelAnimationFrame(current.frameId);

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, DICTATION_STOP_TIMEOUT_MS);
      current.onEnded = () => {
        clearTimeout(timeout);
        resolve();
      };
      current.recognition.stop();
    });

    const transcript = appendTranscript(current.finalText, current.interimText);
    release();
    reset();
    return transcript;
  }, [release, reset]);

  const cancel = useCallback(() => {
    const current = resourcesRef.current;
    if (!current) return;
    current.stopping = true;
    current.recognition.abort();
    release();
    reset();
  }, [release, reset]);

  useEffect(
    () => () => {
      const current = resourcesRef.current;
      if (!current) return;
      current.stopping = true;
      current.recognition.abort();
      release();
    },
    [release],
  );

  return {
    status,
    isActive: status !== 'idle',
    levels,
    elapsedMs,
    start,
    stop,
    cancel,
  };
}
