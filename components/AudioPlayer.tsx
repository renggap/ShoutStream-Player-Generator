import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { VolumeOffIcon } from './icons/VolumeOffIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { UserIcon } from './icons/UserIcon';

interface AudioPlayerProps {
  streamUrl: string;
  logoUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ streamUrl, logoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(1);
  const [status, setStatus] = useState('Ready');
  const [metadata, setMetadata] = useState<{ songTitle: string; listeners: string | null }>({ songTitle: 'Loading...', listeners: null });
  const [logoError, setLogoError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const effectiveStreamUrl = useMemo(() => {
    if (streamUrl.startsWith('http:') && window.location.protocol === 'https:') {
      console.log('Insecure stream detected. Using proxy.');
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(streamUrl)}`;
    }
    return streamUrl;
  }, [streamUrl]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error("Audio play failed:", err);
        let errorMessage = 'Failed to load audio source.';
        if (streamUrl.startsWith('http:')) {
          errorMessage += ' Trying to play an insecure (http) stream on a secure (https) page may be blocked by your browser.';
        }
        setStatus(errorMessage);
      });
    }
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  useEffect(() => {
    const fetchMetadata = async () => {
        try {
            const url = new URL(streamUrl);
            const statsUrl = `${url.protocol}//${url.hostname}${url.port ? ':'+url.port:''}/stats?sid=1&json=1`;
            
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(statsUrl)}`);

            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            const data = await response.json();
            
            setMetadata({
                songTitle: data.songtitle || 'Unknown Song',
                listeners: data.currentlisteners || '0',
            });
        } catch (error) {
            console.error("Failed to fetch stream metadata:", error);
            setMetadata(prev => ({ ...prev, songTitle: 'Metadata Unavailable' }));
        }
    };

    fetchMetadata();
    const intervalId = setInterval(fetchMetadata, 10000); 

    return () => clearInterval(intervalId);
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
        setVolume(audio.volume);
        setIsMuted(audio.muted);
    };
    const handleWaiting = () => setStatus('Buffering...');
    const handlePlaying = () => setStatus('Playing');
    const handleError = () => {
        let errorMessage = 'Failed to load because no supported source was found.';
        if (window.location.protocol === 'https:' && streamUrl.startsWith('http:')) {
          errorMessage = 'Error: The stream is insecure (HTTP). Attempting to play via a secure proxy.';
        }
        setStatus(errorMessage);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, [streamUrl]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if(audioRef.current) {
        audioRef.current.volume = newVolume;
        if(newVolume > 0 && isMuted) {
            setIsMuted(false);
            audioRef.current.muted = false;
        }
    }
  };

  const toggleMute = () => {
      if (!audioRef.current) return;
      if (isMuted) {
          audioRef.current.muted = false;
          setIsMuted(false);
          setVolume(lastVolume > 0.05 ? lastVolume : 0.5);
          audioRef.current.volume = lastVolume > 0.05 ? lastVolume : 0.5;
      } else {
          setLastVolume(volume);
          audioRef.current.muted = true;
          setIsMuted(true);
          setVolume(0);
      }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 animate-slide-up">
      <div className="flex flex-col items-center">
        <div className={`relative w-48 h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full mb-6 transition-all duration-500 overflow-hidden ${isPlaying ? 'scale-105 shadow-lg' : 'scale-100'}`}>
          <div className={`absolute inset-0 border-4 border-blue-500/50 rounded-full ${isPlaying ? 'animate-pulse-slow' : ''}`}></div>
          <div className={`absolute inset-2 border-2 border-purple-500/30 rounded-full ${isPlaying ? 'animate-pulse-slow animation-delay-2s' : ''}`}></div>
          
          {logoUrl && !logoError ? (
            <img src={logoUrl} alt="Stream logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
          ) : (
            <MusicNoteIcon className="w-24 h-24 text-gray-400 dark:text-gray-500"/>
          )}
        </div>

        <div className="text-center w-full mb-6 min-h-[6rem]">
            <div className="relative w-full h-7 overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-max animate-marquee whitespace-nowrap">
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-200 mx-4" title={metadata.songTitle}>{metadata.songTitle}</span>
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-200 mx-4" title={metadata.songTitle}>{metadata.songTitle}</span>
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{status}</p>
            {metadata.listeners !== null && (
                <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                    <UserIcon className="w-4 h-4" />
                    <span>{metadata.listeners} Listeners</span>
                </div>
            )}
        </div>

        <audio ref={audioRef} src={effectiveStreamUrl} preload="none" crossOrigin="anonymous"/>

        <div className="flex items-center justify-center w-full mb-4">
            <button
                onClick={togglePlayPause}
                className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white shadow-lg hover:scale-110 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                aria-label={isPlaying ? 'Stop' : 'Play'}
            >
                {isPlaying ? <StopIcon className="w-8 h-8" /> : <PlayIcon className="w-10 h-10" />}
            </button>
        </div>
        
        <div className="flex items-center gap-3 w-full">
            <button onClick={toggleMute} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
            </button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                aria-label="Volume slider"
            />
        </div>
      </div>
    </div>
  );
};