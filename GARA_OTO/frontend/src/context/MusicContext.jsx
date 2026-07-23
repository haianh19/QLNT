import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import garageTrack from '../assets/music/Vaicaunoicokhiennguoithaydoi (rmx) Thằng mất dạy ft Thằng mất dép . - (320 Kbps).mp3';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = volume / 100;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
      } catch (error) {
        // Browser can block autoplay until there is user interaction.
        console.error('Unable to play audio:', error);
      }
      return;
    }

    audioRef.current.pause();
  };

  const value = useMemo(
    () => ({
      isPlaying,
      volume,
      currentTime,
      duration,
      togglePlay,
      setVolume,
    }),
    [isPlaying, volume, currentTime, duration]
  );

  return (
    <MusicContext.Provider value={value}>
      <audio ref={audioRef} src={garageTrack} loop />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
