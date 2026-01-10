import { useState, useRef, useEffect } from "react";
import { Button, Card, Modal } from "@social/ui";
import { useTheme } from "../providers/ThemeProvider";
import { supabase } from "../../supabase/client";
import type { ViboxQueueItem, ViboxQueueInsert, ViboxQueueUpdate } from "../types/vibox";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Heroicons-style SVG Icon Components
const PlayIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const PauseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);
const SkipBackIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9.75L6.75 12l4.5 2.25V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 9.75L14.25 12l4.5 2.25V9.75z" />
  </svg>
);
const SkipForwardIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75L20.25 12l-4.5 2.25V9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75L12.75 12l-4.5 2.25V9.75z" />
  </svg>
);

const VolumeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53L6.75 15.75V8.25z" />
  </svg>
);
const MusicIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h10.5M9 15h10.5M9 12h6" />
  </svg>
);
const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);
const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
  </svg>
);
const UploadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const ListIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423Z" />
  </svg>
);
const FileTextIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z" />
  </svg>
);
const FolderIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15c.847 0 1.548.434 1.97 1.087l.258.365A2.25 2.25 0 0121.75 12v6.75A2.25 2.25 0 0119.5 21h-15a2.25 2.25 0 01-2.25-2.25v-6.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75h3.75a.75.75 0 01.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 01.75-.75v-.008a.75.75 0 01.75-.75h3.75m-9 6.75h.008v.008h-.008v-.008Z" />
  </svg>
);

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file?: File;
  url: string;
  isPreloaded?: boolean;
  genre?: string;
  primaryVibe?: string;
  secondaryVibe?: string;
}

// Legacy interface for backward compatibility
interface QueueItem {
  id: string;
  track: Track;
  addedBy: string;
  addedAt: number;
}

interface TrackMetadata {
  file: string;
  artist: string;
  primaryVibe: string;
  secondaryVibe: string;
  genre: string;
}

interface VibeHierarchy {
  vibes: {
    [primaryVibe: string]: {
      total: number;
      secondaryVibes: {
        [secondaryVibe: string]: Array<{
          file: string;
          genre: string;
        }>;
      };
    };
  };
}

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
  const [isLoading] = useState(false);
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

  // Helper function to get device type
  const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  // Helper function to get session ID
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('vibox-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vibox-session-id', sessionId);
    }
    return sessionId;
  };

  // Refresh queue when modal opens (Deployed: 2025-01-10 v3f1baa0)
  useEffect(() => {
    if (isOpen) {
      // Load queue immediately when modal opens
      const loadQueueOnOpen = async () => {
        try {
          const { data, error } = await supabase
            .from('vibox_queue' as any)
            .select('*')
            .eq('is_played', false)
            .order('position', { ascending: true });

          if (error) throw error;
          if (data) {
            setQueue(data as unknown as ViboxQueueItem[]);
            console.log('📋 Queue refreshed on open:', data?.length || 0, 'items');
            console.log('🔄 Queue items on open:', data.map((item: any) => ({ id: item.id, track: item.track_title, position: item.position })));
          }
        } catch (error) {
          console.error('Error loading queue on open:', error);
        }
      };
      
      loadQueueOnOpen();
    }
  }, [isOpen]);

  // Load queue from Supabase and set up real-time subscription
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    
    const loadQueue = async () => {
      // Clear existing debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // For initial load, skip debounce to load immediately
      if (isQueueLoading) return; // Prevent concurrent loads
      
      setIsQueueLoading(true);
      try {
        const { data, error } = await supabase
          .from('vibox_queue' as any)
          .select('*')
          .eq('is_played', false)
          .order('position', { ascending: true });

        if (error) throw error;
        if (data) setQueue(data as unknown as ViboxQueueItem[]);
        console.log('📋 Queue loaded:', data?.length || 0, 'items');
      } catch (error) {
        console.error('Error loading queue:', error);
      } finally {
        setIsQueueLoading(false);
      }
    };

    const loadQueueDebounced = async () => {
      console.log('🔄 loadQueueDebounced called');
      // Clear existing debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Debounce to prevent rapid reloads for realtime updates
      debounceTimeoutRef.current = setTimeout(async () => {
        console.log('🔄 Executing debounced queue reload');
        await loadQueue();
      }, 300); // 300ms debounce
    };

    const setupRealtime = async () => {
      // Ensure we're authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', session ? 'authenticated' : 'not authenticated');
      
      if (!session) {
        console.log('🔐 Signing in anonymously for realtime...');
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('❌ Failed to authenticate:', error);
          return;
        }
        console.log('✅ Anonymous auth successful');
      }

      // Check Supabase configuration
      console.log('🌐 Setting up realtime for vibox_queue table...');

      // Set up real-time subscription with status callbacks
      queueChannelRef.current = supabase
        .channel('vibox-queue-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vibox_queue',
          },
          async (payload) => {
            console.log('🎵 REALTIME EVENT:', payload.eventType, payload);
            console.log('🎵 Payload details:', {
              event: payload.eventType,
              table: payload.table,
              schema: payload.schema,
              new: payload.new,
              old: payload.old
            });
            // Use debounced reload for realtime updates
            await loadQueueDebounced();
          }
        )
        .subscribe((status, err) => {
          console.log('🔌 Realtime subscription status:', status);
          if (err) console.error('❌ Realtime subscription error:', err);
          
          // If subscription is successful, clear polling
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connected - polling disabled');
            if (pollingInterval) clearInterval(pollingInterval);
          }
        });
    };

    // Load queue immediately on mount, then setup realtime
    loadQueue();
    setupRealtime();

    // Fallback: Poll every 5 seconds if realtime doesn't connect (reduced frequency)
    pollingInterval = setInterval(() => {
      console.log('🔄 Polling queue (fallback)');
      loadQueue();
    }, 5000);

    return () => {
      if (queueChannelRef.current) {
        console.log('🔌 Unsubscribing from queue changes');
        supabase.removeChannel(queueChannelRef.current);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
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
          console.log('Loaded metadata for', metadataMap.size, 'tracks');
        }

        // Load hierarchical vibe structure
        const vibeResponse = await fetch('/vibox/vibes-hierarchical.json');
        if (vibeResponse.ok) {
          const vibeData = await vibeResponse.json();
          setVibeHierarchy(vibeData);
          console.log('Loaded vibe hierarchy:', Object.keys(vibeData.vibes));
        }

        // Try to fetch the track list from a JSON file
        const response = await fetch('/vibox/tracks.json');
        if (response.ok) {
          const audioFiles = await response.json();
          console.log('Loading', audioFiles.length, 'audio files');
          
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

          console.log('Created', preloadedTracks.length, 'track objects');
          console.log('Sample track:', preloadedTracks[0]);

          if (preloadedTracks.length > 0) {
            setTracks(prev => [...preloadedTracks, ...prev]);
            toast({ 
              title: `Loaded ${preloadedTracks.length} tracks with vibe metadata`, 
              variant: "info" 
            });
          }
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
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

      const { error } = await supabase
        .from('vibox_queue' as any)
        .insert(queueInsert);

      if (error) throw error;

      toast({ 
        title: `Added "${track.title}" to queue`, 
        variant: "success" 
      });
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({ 
        title: "Failed to add to queue", 
        variant: "error" 
      });
    }
  };

  const removeFromQueue = async (queueItemId: string) => {
    try {
      const { error } = await supabase
        .from('vibox_queue' as any)
        .delete()
        .eq('id', queueItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from queue:', error);
      toast({ 
        title: "Failed to remove from queue", 
        variant: "error" 
      });
    }
  };

  const clearQueue = async () => {
    try {
      const { error } = await supabase
        .from('vibox_queue' as any)
        .delete()
        .eq('is_played', false);

      if (error) throw error;

      toast({ title: "Queue cleared", variant: "info" });
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({ 
        title: "Failed to clear queue", 
        variant: "error" 
      });
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
        const { error } = await supabase
          .from('vibox_queue' as any)
          .update({ 
            is_played: true,
            played_at: new Date().toISOString()
          })
          .eq('id', nextItem.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error marking track as played:', error);
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
      const currentTrackFile = currentTrack.url.split('/').pop();
      
      // Find which vibe category the current track is in
      for (const [primaryVibe, primaryData] of Object.entries(vibeHierarchy.vibes)) {
        for (const [secondaryVibe, songs] of Object.entries(primaryData.secondaryVibes)) {
          const songIndex = songs.findIndex(s => s.file === currentTrackFile);
          
          if (songIndex !== -1) {
            // Found the current track, find the next one
            const nextSongIndex = songIndex + 1;
            
            if (nextSongIndex < songs.length) {
              // Next song in same secondary vibe
              const nextSong = songs[nextSongIndex];
              const nextTrack = tracks.find(t => t.url.includes(nextSong.file));
              if (nextTrack) {
                playTrack(nextTrack);
                return;
              }
            } else {
              // Move to next secondary vibe
              const secondaryVibes = Object.entries(primaryData.secondaryVibes);
              const currentSecondaryIndex = secondaryVibes.findIndex(([sv]) => sv === secondaryVibe);
              const nextSecondaryIndex = currentSecondaryIndex + 1;
              
              if (nextSecondaryIndex < secondaryVibes.length) {
                // Next secondary vibe, first song
                const nextSecondary = secondaryVibes[nextSecondaryIndex][1];
                if (nextSecondary.length > 0) {
                  const nextSong = nextSecondary[0];
                  const nextTrack = tracks.find(t => t.url.includes(nextSong.file));
                  if (nextTrack) {
                    playTrack(nextTrack);
                    return;
                  }
                }
              } else {
                // Move to next primary vibe
                const primaryVibes = Object.entries(vibeHierarchy.vibes);
                const currentPrimaryIndex = primaryVibes.findIndex(([pv]) => pv === primaryVibe);
                const nextPrimaryIndex = (currentPrimaryIndex + 1) % primaryVibes.length;
                const nextPrimary = primaryVibes[nextPrimaryIndex][1];
                
                // First secondary vibe, first song
                const firstSecondary = Object.entries(nextPrimary.secondaryVibes)[0][1];
                if (firstSecondary.length > 0) {
                  const nextSong = firstSecondary[0];
                  const nextTrack = tracks.find(t => t.url.includes(nextSong.file));
                  if (nextTrack) {
                    playTrack(nextTrack);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Fallback to original behavior if not in vibe mode or vibe lookup fails
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  
  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    // If we're in vibe mode, follow the vibe order in reverse
    if (viewMode === 'vibes' && vibeHierarchy) {
      const currentTrackFile = currentTrack.url.split('/').pop();
      
      // Find which vibe category the current track is in
      for (const [primaryVibe, primaryData] of Object.entries(vibeHierarchy.vibes)) {
        for (const [secondaryVibe, songs] of Object.entries(primaryData.secondaryVibes)) {
          const songIndex = songs.findIndex(s => s.file === currentTrackFile);
          
          if (songIndex !== -1) {
            // Found the current track, find the previous one
            const prevSongIndex = songIndex - 1;
            
            if (prevSongIndex >= 0) {
              // Previous song in same secondary vibe
              const prevSong = songs[prevSongIndex];
              const prevTrack = tracks.find(t => t.url.includes(prevSong.file));
              if (prevTrack) {
                playTrack(prevTrack);
                return;
              }
            } else {
              // Move to previous secondary vibe
              const secondaryVibes = Object.entries(primaryData.secondaryVibes);
              const currentSecondaryIndex = secondaryVibes.findIndex(([sv]) => sv === secondaryVibe);
              const prevSecondaryIndex = currentSecondaryIndex - 1;
              
              if (prevSecondaryIndex >= 0) {
                // Previous secondary vibe, last song
                const prevSecondary = secondaryVibes[prevSecondaryIndex][1];
                if (prevSecondary.length > 0) {
                  const prevSong = prevSecondary[prevSecondary.length - 1];
                  const prevTrack = tracks.find(t => t.url.includes(prevSong.file));
                  if (prevTrack) {
                    playTrack(prevTrack);
                    return;
                  }
                }
              } else {
                // Move to previous primary vibe
                const primaryVibes = Object.entries(vibeHierarchy.vibes);
                const currentPrimaryIndex = primaryVibes.findIndex(([pv]) => pv === primaryVibe);
                const prevPrimaryIndex = currentPrimaryIndex === 0 ? primaryVibes.length - 1 : currentPrimaryIndex - 1;
                const prevPrimary = primaryVibes[prevPrimaryIndex][1];
                
                // Last secondary vibe, last song
                const secondaryVibes = Object.entries(prevPrimary.secondaryVibes);
                const lastSecondary = secondaryVibes[secondaryVibes.length - 1][1];
                if (lastSecondary.length > 0) {
                  const prevSong = lastSecondary[lastSecondary.length - 1];
                  const prevTrack = tracks.find(t => t.url.includes(prevSong.file));
                  if (prevTrack) {
                    playTrack(prevTrack);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Fallback to original behavior if not in vibe mode or vibe lookup fails
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
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
                  disabled={isLoading}
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
                                      {songs.map((song, idx) => {
                                        const track = tracks.find(t => {
                                          const urlFilename = t.url.split('/').pop();
                                          return urlFilename === song.file || t.url.includes(song.file);
                                        });
                                        if (!track) {
                                          console.log('Track not found for:', song.file, 'Available tracks:', tracks.length);
                                          if (idx === 0) {
                                            console.log('Sample available track URL:', tracks[0]?.url);
                                          }
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
