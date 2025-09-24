import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { PlayerPage } from './components/PlayerPage';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';

enum Route {
  Home,
  Player,
}

interface PlayerData {
  streamUrl: string;
  logoUrl?: string;
}

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(Route.Home);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/player/')) {
        try {
          const encodedData = hash.substring(9);
          const decodedJson = atob(encodedData);
          
          let data: PlayerData;
          try {
            // New format: JSON object
            const parsedData = JSON.parse(decodedJson);
            if (typeof parsedData === 'object' && parsedData !== null && 'streamUrl' in parsedData) {
               data = parsedData;
            } else {
              throw new Error("Invalid player data structure");
            }
          } catch (e) {
            // Fallback for old format: raw URL string
            console.warn("Falling back to legacy URL format.");
            data = { streamUrl: decodedJson };
          }

          if (data.streamUrl && data.streamUrl.startsWith('http')) {
            setPlayerData(data);
            setRoute(Route.Player);
          } else {
            throw new Error("Invalid stream URL in player data");
          }
        } catch (error) {
          console.error("Failed to decode player data from hash:", error);
          window.location.hash = '';
          setRoute(Route.Home);
        }
      } else {
        setPlayerData(null);
        setRoute(Route.Home);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleGeneratePlayer = (streamUrl: string, logoUrl: string) => {
    const data: PlayerData = { streamUrl };
    if (logoUrl) {
        data.logoUrl = logoUrl;
    }
    const encodedData = btoa(JSON.stringify(data));
    window.location.hash = `#/player/${encodedData}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <main className="container mx-auto px-4 py-8">
        {route === Route.Home && <HomePage onGenerate={handleGeneratePlayer} />}
        {route === Route.Player && playerData && (
          <PlayerPage 
            streamUrl={playerData.streamUrl} 
            logoUrl={playerData.logoUrl}
          />
        )}
      </main>
    </div>
  );
};

export default App;