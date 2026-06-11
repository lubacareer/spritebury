"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUSIC_SRC = "/assets/soundtrack1.mp3";
const MUSIC_VOLUME = 0.35;

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = MUSIC_VOLUME;

    try {
      await audio.play();
    } catch {
      // Browsers block unmuted autoplay until the player interacts.
    }
  }, []);

  useEffect(() => {
    if (!enabled || isPlaying) {
      return;
    }

    const unlockMusic = () => {
      void tryPlay();
    };

    window.addEventListener("pointerdown", unlockMusic, { once: true });
    window.addEventListener("keydown", unlockMusic, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
    };
  }, [enabled, isPlaying, tryPlay]);

  function handleToggle() {
    if (enabled && isPlaying) {
      setEnabled(false);
      audioRef.current?.pause();
      return;
    }

    setEnabled(true);
    void tryPlay();
  }

  const label = enabled ? (isPlaying ? "Music On" : "Start Music") : "Music Off";

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        aria-pressed={enabled && isPlaying}
        onClick={handleToggle}
        className="pixel-button fixed bottom-3 right-3 z-50 rounded-md bg-[#2f95df] px-3 py-2 text-xs font-black uppercase text-white shadow-lg"
      >
        {label}
      </button>
    </>
  );
}
