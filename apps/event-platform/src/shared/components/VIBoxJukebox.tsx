import { useState, useRef, useEffect } from "react";
import { Button, Card, Modal } from "@social/ui";
import { useTheme } from "../providers/ThemeProvider";
import { supabase } from "../../supabase/client";
import type { ViboxQueueItem, ViboxQueueInsert, Track, TrackMetadata, VibeHierarchy } from "../types/vibox";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { viboxApi } from "../api/vibox";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  MusicIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  UploadIcon,
  ListIcon,
  SparklesIcon,
  FileTextIcon,
  FolderIcon
} from "./icons/VIBoxIcons";
import { getDeviceType } from "../utils/device";
import { getSessionId } from "../utils/session";
import { getEnvironmentInfo } from "../utils/environment";
import { log } from "../utils/logger";
import { testRealtimeConnectivity, startRealtimeMonitoring } from "../utils/realtimeDebug";
import { getNextTrackByVibe, getPreviousTrackByVibe, getNextTrackLinear, getPreviousTrackLinear } from "../utils/vibeNavigation";
import { handleQueueError, handleQueueSuccess, handleQueueInfo } from "../utils/errorHandlers";


interface VIBoxJukeboxProps {
  isOpen: boolean;
  onClose: () => void;
  toast: (options: { title: string; variant: "success" | "error" | "info" }) => void;
  mode?: "host" | "team";
  allowUploads?: boolean;
}

export function VIBoxJukebox({ 
  isOpen, 
  onClose, 
  toast, 
  mode = "host",
  allowUploads = true 
}: VIBoxJukeboxProps) {
  const { isDark } = useTheme();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [vibeHierarchy, setVibeHierarchy] = useState<VibeHierarchy | null>(null);
  const [trackMetadata, setTrackMetadata] = useState<Map<string, TrackMetadata>>(new Map());
  const [expandedPrimaryVibes, setExpandedPrimaryVibes] = useState<Set<string>>(new Set());
  const [expandedSecondaryVibes, setExpandedSecondaryVibes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'vibes' | 'all'>('vibes');
  const [queue, setQueue] = useState<ViboxQueueItem[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queueChannelRef = useRef<RealtimeChannel | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  
  // Pure realtime approach - no polling
  useEffect(() => {
    console.log('🔍 VIBox Debug - Setting up pure realtime');
    
    const fetchQueue = () => {
      console.log('🔍 VIBox Debug - Fetching queue');
      viboxApi.getQueue().then((response) => {
        if (response.success && response.data) {
          setQueue(response.data.queue);
          console.log('🔍 VIBox Debug - Queue fetched:', response.data.count, 'items');
        }
      });
    };

    // Initial fetch
    fetchQueue();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('vibox-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibox_queue',
        },
        (payload) => {
          console.log('🔍 VIBox Debug - Realtime event received:', payload.eventType);
          // Immediate fetch for realtime events
          fetchQueue();
        }
      )
      .subscribe((status, err) => {
        console.log('🔍 VIBox Debug - Realtime status:', status, err?.message);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ VIBox Debug - Realtime connected successfully');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ VIBox Debug - Realtime failed:', status, err?.message);
        }
      });

    return () => {
      console.log('🔍 VIBox Debug - Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, []);

  // Load pre-loaded tracks and metadata from public directory on mount
  useEffect(() => {
    const loadPreloadedTracks = async () => {
      try {
        // Load track metadata first
        const metadataResponse = await fetch('/vibox/tracks-metadata.json');
        let metadataMap = new Map<string, TrackMetadata>();
        
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          metadata.tracks.forEach((track: TrackMetadata) => {
            metadataMap.set(track.file, track);
          });
          setTrackMetadata(metadataMap);
          log.info('Loaded metadata', { trackCount: metadataMap.size });
        }

        // Load hierarchical vibe structure
        const vibeResponse = await fetch('/vibox/vibes-hierarchical.json');
        if (vibeResponse.ok) {
          const vibeData = await vibeResponse.json();
          setVibeHierarchy(vibeData);
          log.info('Loaded vibe hierarchy', { vibeKeys: Object.keys(vibeData.vibes) });
        }

        // Try to fetch the track list from a JSON file
        const response = await fetch('/vibox/tracks.json');
        if (response.ok) {
          const audioFiles = await response.json();
          log.info('Loading audio files', { count: audioFiles.length });
          
          const preloadedTracks: Track[] = audioFiles.map((filename: string) => {
            const fileName = filename.replace(/\.[^/.]+$/, "");
            const metadata = metadataMap.get(filename);

            return {
              id: `preloaded-${filename}`,
              title: fileName,
              artist: metadata?.artist || 'Söcial',
              duration: 0,
              url: `/vibox/${filename}`,
              isPreloaded: true,
              genre: metadata?.genre,
              primaryVibe: metadata?.primaryVibe,
              secondaryVibe: metadata?.secondaryVibe
            };
          });

          log.info('Created track objects', { count: preloadedTracks.length });
          log.debug('Sample track', { track: preloadedTracks[0] });

          if (preloadedTracks.length > 0) {
            setTracks(prev => [...preloadedTracks, ...prev]);
            toast({ 
              title: `Loaded ${preloadedTracks.length} tracks with vibe metadata`, 
              variant: "info" 
            });
          }
        }
      } catch (error) {
        log.error('Error loading tracks', { error });
      }
    };

    if (isOpen && tracks.length === 0) {
      loadPreloadedTracks();
    }
  }, [isOpen, tracks.length, toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      // If there are songs in the queue, play the next one from queue
      if (queue.length > 0) {
        playNextInQueue();
      } else {
        // Otherwise, use vibe-based navigation
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, queue]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowUploads) return;
    
    const files = event.target.files;
    if (!files) return;
    processFiles(files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!allowUploads) return;
    
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!allowUploads) return;
    
    event.preventDefault();
  };

  const processFiles = (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3')
    );

    if (audioFiles.length === 0) {
      toast({ title: 'No audio files found', variant: 'error' });
      return;
    }

    const newTracks: Track[] = audioFiles.map((file, index) => {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const parts = fileName.split(' - ');
      const title = parts[1] || parts[0] || fileName;
      const artist = parts[1] ? parts[0] : 'Unknown Artist';

      return {
        id: `track-${Date.now()}-${index}`,
        title: title.trim(),
        artist: artist.trim(),
        duration: 0, // Will be updated when loaded
        file,
        url: URL.createObjectURL(file),
        isPreloaded: false
      };
    });

    setTracks(prev => [...prev, ...newTracks]);
    toast({ title: `Added ${newTracks.length} track${newTracks.length !== 1 ? 's' : ''}`, variant: "success" });
  };

  const addToQueue = async (track: Track) => {
    try {
      const queueInsert: ViboxQueueInsert = {
        track_id: track.id,
        track_title: track.title,
        track_artist: track.artist,
        track_url: track.url,
        track_genre: track.genre,
        track_duration: track.duration,
        primary_vibe: track.primaryVibe,
        secondary_vibe: track.secondaryVibe,
        added_by: mode === "host" ? "Host" : "Patron",
        device_type: getDeviceType(),
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      };

      const response = await viboxApi.addToQueue(queueInsert);

      if (!response.success) {
        throw new Error(response.error || 'Failed to add to queue');
      }

      handleQueueSuccess(response.message || `Added "${track.title}" to queue`, toast);
    } catch (error) {
      handleQueueError(error, 'add to queue', toast);
    }
  };

  const removeFromQueue = async (queueItemId: string) => {
    try {
      const response = await viboxApi.removeFromQueue(queueItemId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove from queue');
      }
    } catch (error) {
      handleQueueError(error, 'remove from queue', toast);
    }
  };

  const clearQueue = async () => {
    try {
      const response = await viboxApi.clearQueue();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to clear queue');
      }

      handleQueueInfo(response.message || "Queue cleared", toast);
    } catch (error) {
      handleQueueError(error, 'clear queue', toast);
    }
  };

  const playNextInQueue = async () => {
    if (queue.length > 0) {
      const nextItem = queue[0];
      
      // Create a Track object from the queue item
      const track: Track = {
        id: nextItem.track_id,
        title: nextItem.track_title,
        artist: nextItem.track_artist,
        url: nextItem.track_url,
        duration: nextItem.track_duration || 0,
        genre: nextItem.track_genre || undefined,
        primaryVibe: nextItem.primary_vibe || undefined,
        secondaryVibe: nextItem.secondary_vibe || undefined,
        isPreloaded: true,
      };
      
      playTrack(track);
      
      // Mark as played instead of removing
      try {
        const response = await viboxApi.markPlayed(nextItem.id);
        
        if (!response.success) {
          handleQueueError(response.error, 'mark track as played', toast);
        }
      } catch (error) {
        handleQueueError(error, 'mark track as played', toast);
      }
    }
  };

  const playTrack = (track: Track) => {
    if (audioRef.current && track.url) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    // If we're in vibe mode, follow the vibe order
    if (viewMode === 'vibes' && vibeHierarchy) {
      const nextTrack = getNextTrackByVibe(currentTrack, tracks, vibeHierarchy);
      if (nextTrack) {
        playTrack(nextTrack);
        return;
      }
    }
    
    // Fallback to linear behavior
    const nextTrack = getNextTrackLinear(currentTrack, tracks);
    playTrack(nextTrack);
  };

  
  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    // If we're in vibe mode, follow the vibe order in reverse
    if (viewMode === 'vibes' && vibeHierarchy) {
      const prevTrack = getPreviousTrackByVibe(currentTrack, tracks, vibeHierarchy);
      if (prevTrack) {
        playTrack(prevTrack);
        return;
      }
    }
    
    // Fallback to linear behavior
    const prevTrack = getPreviousTrackLinear(currentTrack, tracks);
    playTrack(prevTrack);
  };

  const removeTrack = (trackId: string) => {
    if (!allowUploads) return;
    
    const track = tracks.find(t => t.id === trackId);
    
    // Clean up object URL for uploaded files
    if (track?.url && !track.isPreloaded && track.url.startsWith('blob:')) {
      URL.revokeObjectURL(track.url);
    }
    
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  };

  const clearAll = () => {
    if (!allowUploads) return;
    
    // Clean up object URLs for uploaded files
    tracks.forEach(track => {
      if (track.url && !track.isPreloaded && track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
      }
    });
    
    setTracks(tracks.filter(t => t.isPreloaded));
    setCurrentTrack(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModalTitle = () => {
    return mode === "team" ? "🎵 VIBox Jukebox - Team View" : "🎵 VIBox Jukebox";
  };

  return (
    <>
      <audio ref={audioRef} />
      
      <Modal
        open={isOpen}
        onClose={onClose}
        title={getModalTitle()}
        isDark={isDark}
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button 
                variant={showQueue ? "primary" : "secondary"} 
                onClick={() => setShowQueue(!showQueue)}
              >
                🎵 Queue ({queue.length})
              </Button>
            </div>
            <div className="flex gap-2">
              {mode === "host" && queue.length > 0 && (
                <Button variant="secondary" onClick={clearQueue}>
                  Clear Queue
                </Button>
              )}
                            {allowUploads && tracks.filter(t => !t.isPreloaded).length > 0 && (
                <Button variant="secondary" onClick={clearAll}>
                  Clear Uploads
                </Button>
              )}
              {allowUploads && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={false}
                >
                  Add Tracks
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* File Input */}
          {allowUploads && (
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/mp3,audio/wav,audio/flac,audio/aac"
              onChange={handleFileUpload}
              className="hidden"
            />
          )}

          {/* Current Player */}
          {currentTrack && (
            <Card className="p-4" isDark={isDark}>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className={`text-lg font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                    {currentTrack.title}
                  </h3>
                  <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div 
                    className={`w-full h-2 rounded-full cursor-pointer transition-colors ${!isDark ? 'bg-slate-200 hover:bg-slate-300' : 'bg-slate-600 hover:bg-slate-500'}`}
                    onClick={(e) => {
                      if (!audioRef.current || !currentTrack) return;
                      
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const width = rect.width;
                      const percentage = clickX / width;
                      const newTime = percentage * (audioRef.current.duration || 0);
                      
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }}
                    title="Click to jump to position"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all relative"
                      style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={!isDark ? 'text-slate-500' : 'text-cyan-400'}>
                      {formatTime(currentTime)}
                    </span>
                    <span className={!isDark ? 'text-slate-500' : 'text-cyan-400'}>
                      {formatTime(audioRef.current?.duration || 0)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playPrevious}
                    disabled={tracks.length <= 1}
                  >
                    <SkipBackIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full"
                  >
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={playNext}
                    disabled={tracks.length <= 1}
                    title="Next track"
                  >
                    <SkipForwardIcon className="w-5 h-5" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3">
                  <VolumeIcon className="w-4 h-4" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-xs w-10 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Queue Panel */}
          {showQueue && (
            <Card className="p-4 mb-4" isDark={isDark}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-700' : 'text-cyan-100'}`}>
                    Queue ({queue.length} {queue.length === 1 ? 'song' : 'songs'})
                  </h4>
                  {mode === "host" && queue.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => playNextInQueue()}>
                      Play Next in Queue
                    </Button>
                  )}
                </div>
                
                {queue.length === 0 ? (
                  <div className={`text-center py-4 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    <p className="text-sm">Queue is empty</p>
                    <p className="text-xs mt-1">
                      {mode === "host" ? "Songs will appear here when patrons add them" : "Browse songs and click 'Add to Queue'"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {queue.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded border ${
                          !isDark ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`text-xs font-bold ${!isDark ? 'text-slate-400' : 'text-cyan-500'}`}>
                            #{index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${!isDark ? 'text-slate-900' : 'text-cyan-100'}`}>
                              {item.track_title}
                            </p>
                            <p className={`text-xs truncate ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                              {item.track_genre} • {item.track_artist} • Added by {item.added_by}
                            </p>
                          </div>
                        </div>
                        {mode === "host" && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const track: Track = {
                                  id: item.track_id,
                                  title: item.track_title,
                                  artist: item.track_artist,
                                  url: item.track_url,
                                  duration: item.track_duration || 0,
                                  genre: item.track_genre || undefined,
                                  primaryVibe: item.primary_vibe || undefined,
                                  secondaryVibe: item.secondary_vibe || undefined,
                                  isPreloaded: true,
                                };
                                playTrack(track);
                              }}
                            >
                              <PlayIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromQueue(item.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Track List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-700' : 'text-cyan-100'}`}>
                Track Library ({tracks.length})
              </h4>
              <div className="flex items-center gap-3">
                {vibeHierarchy && (
                  <div className="flex gap-1 border rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('vibes')}
                      className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                        viewMode === 'vibes'
                          ? 'bg-purple-500 text-white'
                          : !isDark ? 'text-slate-600 hover:bg-slate-100' : 'text-cyan-300 hover:bg-slate-700'
                      }`}
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>By Vibe</span>
                    </button>
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                        viewMode === 'all'
                          ? 'bg-purple-500 text-white'
                          : !isDark ? 'text-slate-600 hover:bg-slate-100' : 'text-cyan-300 hover:bg-slate-700'
                      }`}
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                      <span>All Tracks</span>
                    </button>
                  </div>
                )}
                {mode === "team" && (
                  <span className={`text-xs flex items-center gap-1 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                    {allowUploads ? (
                      <>
                        <UploadIcon className="w-3 h-3" />
                        <span>Can upload</span>
                      </>
                    ) : (
                      <>
                        <FileTextIcon className="w-3 h-3" />
                        <span>View only</span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
            
            {viewMode === 'vibes' && vibeHierarchy ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(vibeHierarchy.vibes)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([primaryVibe, data]) => {
                    const isPrimaryExpanded = expandedPrimaryVibes.has(primaryVibe);
                    
                    return (
                      <div key={primaryVibe} className="space-y-1">
                        {/* Primary Vibe */}
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedPrimaryVibes);
                            if (isPrimaryExpanded) {
                              newExpanded.delete(primaryVibe);
                            } else {
                              newExpanded.add(primaryVibe);
                            }
                            setExpandedPrimaryVibes(newExpanded);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                            !isDark 
                              ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100' 
                              : 'border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 hover:from-purple-900/30 hover:to-pink-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isPrimaryExpanded ? (
                              <ChevronDownIcon className="w-5 h-5" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" />
                            )}
                            <div className="text-left">
                              <p className={`font-bold text-sm ${!isDark ? 'text-purple-900' : 'text-purple-300'}`}>
                                {primaryVibe}
                              </p>
                              <p className={`text-xs ${!isDark ? 'text-purple-600' : 'text-purple-400'}`}>
                                {data.total} tracks
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Secondary Vibes */}
                        {isPrimaryExpanded && (
                          <div className="ml-6 space-y-1">
                            {Object.entries(data.secondaryVibes).map(([secondaryVibe, songs]) => {
                              const isSecondaryExpanded = expandedSecondaryVibes.has(`${primaryVibe}-${secondaryVibe}`);
                              
                              return (
                                <div key={secondaryVibe} className="space-y-1">
                                  {/* Secondary Vibe */}
                                  <button
                                    onClick={() => {
                                      const key = `${primaryVibe}-${secondaryVibe}`;
                                      const newExpanded = new Set(expandedSecondaryVibes);
                                      if (isSecondaryExpanded) {
                                        newExpanded.delete(key);
                                      } else {
                                        newExpanded.add(key);
                                      }
                                      setExpandedSecondaryVibes(newExpanded);
                                    }}
                                    className={`w-full flex items-center justify-between p-2 rounded border transition-colors ${
                                      !isDark
                                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                                        : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isSecondaryExpanded ? (
                                        <ChevronDownIcon className="w-4 h-4" />
                                      ) : (
                                        <ChevronRightIcon className="w-4 h-4" />
                                      )}
                                      <div className="text-left">
                                        <p className={`text-sm font-medium ${!isDark ? 'text-slate-900' : 'text-cyan-100'}`}>
                                          {secondaryVibe}
                                        </p>
                                        <p className={`text-xs ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                                          {songs.length} tracks
                                        </p>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Songs */}
                                  {isSecondaryExpanded && (
                                    <div className="ml-6 space-y-1">
                                      {songs.map((song) => {
                                        const track = tracks.find(t => {
                                          const urlFilename = t.url.split('/').pop();
                                          return urlFilename === song.file || t.url.includes(song.file);
                                        });
                                        if (!track) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            key={track.id}
                                            className={`flex items-center justify-between p-2 rounded border text-sm ${
                                              !isDark ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                                            } ${currentTrack?.id === track.id ? 'ring-1 ring-purple-400' : ''}`}
                                          >
                                            <div className="flex-1 min-w-0">
                                              <p className={`text-xs font-medium truncate ${!isDark ? 'text-slate-900' : 'text-cyan-100'}`}>
                                                {track.title}
                                              </p>
                                              <p className={`text-xs truncate ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                                                {song.genre} • {track.artist}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              {currentTrack?.id === track.id && isPlaying && (
                                                <PlayIcon className="w-3 h-3 text-purple-500" />
                                              )}
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => currentTrack?.id === track.id && isPlaying ? togglePlayPause() : playTrack(track)}
                                                title={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"}
                                              >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                  <PauseIcon className="w-3.5 h-3.5" />
                                                ) : (
                                                  <PlayIcon className="w-3.5 h-3.5" />
                                                )}
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addToQueue(track)}
                                                title="Add to Queue"
                                                className="text-purple-500 hover:text-purple-600"
                                              >
                                                <span className="text-xs">+Q</span>
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : tracks.length === 0 ? (
              <div
                className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                  !isDark ? 'border-slate-300 bg-slate-50 hover:border-purple-400' : 'border-slate-600 bg-slate-800 hover:border-purple-500'
                }`}
                onDrop={allowUploads ? handleDrop : undefined}
                onDragOver={allowUploads ? handleDragOver : undefined}
              >
                <div className="flex justify-center mb-2">
                  <MusicIcon className="w-12 h-12 text-slate-400" />
                </div>
                <p className={`text-sm ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                  No tracks loaded yet
                </p>
                <p className={`text-xs mt-1 ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
                  {allowUploads 
                    ? "Drag & drop MP3 files here or click \"Add Tracks\"" 
                    : "Waiting for host to add tracks..."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      !isDark ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                    } ${currentTrack?.id === track.id ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        !isDark ? 'text-slate-900' : 'text-cyan-100'
                      }`}>
                        {track.title}
                      </p>
                      <p className={`text-xs truncate ${
                        !isDark ? 'text-slate-500' : 'text-cyan-400'
                      }`}>
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.isPreloaded && (
                        <span className="text-xs text-blue-500 flex items-center gap-1">
                          <FolderIcon className="w-3 h-3" />
                          <span>Preloaded</span>
                        </span>
                      )}
                      {currentTrack?.id === track.id && isPlaying && (
                        <span className="text-xs text-purple-500 flex items-center gap-1">
                          <PlayIcon className="w-3 h-3" />
                          <span>Playing</span>
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => currentTrack?.id === track.id && isPlaying ? togglePlayPause() : playTrack(track)}
                        title={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <PauseIcon className="w-4 h-4" />
                        ) : (
                          <PlayIcon className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addToQueue(track)}
                        title="Add to Queue"
                        className="text-purple-500 hover:text-purple-600"
                      >
                        <span className="text-xs">+Q</span>
                      </Button>
                      {!track.isPreloaded && allowUploads && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrack(track.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
