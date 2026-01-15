import { useState, useRef, useEffect } from 'react';
import { useViboxQueue } from '../../hooks/vibox';
import type { ViboxQueueItem } from '@social/vibox-client';

export function VIBoxPlayer() {
  const { queue, isLoading, error, removeFromQueue, markPlayed, skipTrack, clearQueue } = useViboxQueue();
  const [currentTrack, setCurrentTrack] = useState<ViboxQueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (queue.length > 0 && !currentTrack) {
      setCurrentTrack(queue[0]);
    }
  }, [queue, currentTrack]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.track_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = async () => {
    if (currentTrack) {
      const playDuration = Math.floor(currentTime);
      const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      await markPlayed(currentTrack.id, {
        play_duration: playDuration,
        completion_percentage: completionPercentage,
        was_skipped: false,
      });

      const nextTrack = queue.find(t => t.id !== currentTrack.id);
      setCurrentTrack(nextTrack || null);
      setCurrentTime(0);
    }
  };

  const handleSkip = async () => {
    if (currentTrack) {
      await skipTrack(currentTrack.id);
      const nextTrack = queue.find(t => t.id !== currentTrack.id);
      setCurrentTrack(nextTrack || null);
      setCurrentTime(0);
    }
  };

  const handleRemove = async (id: string) => {
    await removeFromQueue(id);
    if (currentTrack?.id === id) {
      const nextTrack = queue.find(t => t.id !== id);
      setCurrentTrack(nextTrack || null);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-white">Loading VIBox...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 rounded-lg">
        <p className="text-white">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 rounded-lg shadow-xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🎵 VIBox Jukebox</h2>
        <p className="text-amber-100">Queue: {queue.length} tracks</p>
      </div>

      {currentTrack && (
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-semibold text-white mb-1">
            {currentTrack.track_title}
          </h3>
          <p className="text-amber-100 mb-3">{currentTrack.track_artist}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-amber-100 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-colors"
              >
                ▶ Play
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition-colors"
              >
                ⏸ Pause
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ⏭ Skip
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              ✓ Next
            </button>
          </div>

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleTimeUpdate}
          />
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Queue</h3>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="text-amber-100 text-center py-8">
            Queue is empty. Add some tracks!
          </p>
        ) : (
          queue.map((track, index) => (
            <div
              key={track.id}
              className={`bg-white/10 rounded-lg p-3 flex justify-between items-center ${
                currentTrack?.id === track.id ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-semibold">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{track.track_title}</p>
                    <p className="text-amber-100 text-sm">{track.track_artist}</p>
                  </div>
                </div>
                {track.track_genre && (
                  <span className="text-xs text-amber-200 mt-1 inline-block">
                    {track.track_genre}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemove(track.id)}
                className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white text-sm rounded transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
