import React, { useState } from 'react';
import { PlayIcon } from './icons/PlayIcon';

interface HomePageProps {
  onGenerate: (streamUrl: string, logoUrl: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGenerate }) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) {
      setError('Please enter a stream URL.');
      return;
    }
    
    try {
      // Validate stream URL
      new URL(streamUrl);
      
      // Validate optional logo URL if provided
      if(logoUrl.trim()){
        new URL(logoUrl);
      }
      
      setError('');

      let finalStreamUrl = streamUrl.trim();
      // Heuristic: if it looks like a base URL, append the common stream path.
      if (!finalStreamUrl.includes(';stream') && !finalStreamUrl.split('/').pop()?.includes('.')) {
          if (!finalStreamUrl.endsWith('/')) {
              finalStreamUrl += '/';
          }
          finalStreamUrl += ';stream.mp3';
      }

      onGenerate(finalStreamUrl, logoUrl.trim());

    } catch (_) {
      setError('Please enter a valid URL.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
          ShoutStream Player
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Enter any Shoutcast or Icecast stream URL to generate a beautiful, shareable audio player.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl animate-slide-up space-y-4" style={{ animationDelay: '0.2s' }}>
        <div className="relative">
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="e.g., http://stream.example.com:8000/"
            className="w-full pl-4 pr-32 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-full focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-300"
            required
          />
           <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <PlayIcon className="w-5 h-5" />
            <span>Generate</span>
          </button>
        </div>
        <div>
            <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Optional: Logo URL (e.g., https://.../logo.png)"
                className="w-full px-4 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-full focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-300"
            />
        </div>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
       <div className="mt-8 text-center text-gray-500 dark:text-gray-500 text-sm">
          <p>Example Stream: <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-md">https://alfaruq1.ssl.radioislam.my.id/</code></p>
        </div>
    </div>
  );
};