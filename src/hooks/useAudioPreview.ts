import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();
let activeUrl: string | null = null;
let activeOwner: symbol | null = null;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot() {
  return activeUrl;
}

function emit() {
  listeners.forEach((fn) => fn());
}

/**
 * Lazily creates the shared HTMLAudioElement on first use. Mobile Safari
 * requires the element to be instantiated inside a user gesture for
 * `play()` to be allowed; creating it at module load time triggers
 * NotAllowedError on the first playback attempt.
 */
function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.addEventListener("ended", () => {
      activeUrl = null;
      activeOwner = null;
      emit();
    });
  }
  return audio;
}

export default function useAudioPreview() {
  const playingUrl = useSyncExternalStore(subscribe, getSnapshot);
  const ownerId = useRef(Symbol());

  useEffect(() => {
    const id = ownerId.current;
    return () => {
      if (activeOwner === id && audio) {
        audio.pause();
        audio.src = "";
        activeUrl = null;
        activeOwner = null;
        emit();
      }
    };
  }, []);

  const toggle = useCallback((previewUrl: string) => {
    const a = getAudio();
    if (activeUrl === previewUrl && !a.paused) {
      a.pause();
      activeUrl = null;
      activeOwner = null;
      emit();
      return;
    }

    a.pause();
    a.src = previewUrl;
    activeUrl = previewUrl;
    activeOwner = ownerId.current;
    emit();

    const playPromise = a.play();
    if (playPromise) {
      playPromise.catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (activeUrl !== previewUrl) return;
        activeUrl = null;
        activeOwner = null;
        emit();
      });
    }
  }, []);

  const stop = useCallback(() => {
    if (activeOwner !== ownerId.current || !audio) return;
    audio.pause();
    audio.src = "";
    activeUrl = null;
    activeOwner = null;
    emit();
  }, []);

  const isTrackPlaying = useCallback(
    (url: string) => playingUrl === url,
    [playingUrl]
  );

  return { toggle, stop, isTrackPlaying };
}
