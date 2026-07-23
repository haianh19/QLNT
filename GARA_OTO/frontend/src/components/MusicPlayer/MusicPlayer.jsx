import React from 'react';
import { useMusic } from '../../context/MusicContext';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const { isPlaying, volume, currentTime, duration, togglePlay, setVolume } = useMusic();

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="music-player-mini">
        <div className="player-header">
          <span className="player-icon">🎵</span>
          <span className="player-title">Now Playing: Chill Garage Vibes</span>
        </div>

        <div className="player-controls">
          <button
            className={`player-btn play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="player-volume">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider"
              aria-label="Volume"
            />
            <span className="volume-value">{volume}%</span>
          </div>
        </div>

        <div className="player-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {isPlaying && (
          <div className="equalizer">
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
            <div className="eq-bar"></div>
          </div>
        )}
      </div>
    </>
  );
}
