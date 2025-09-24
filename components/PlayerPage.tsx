import React, { useState, useEffect } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';


interface PlayerPageProps {
  streamUrl: string;
  logoUrl?: string;
}

export const PlayerPage: React.FC<PlayerPageProps> = ({ streamUrl, logoUrl }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState(true);

  useEffect(() => {
    const shortenUrl = async (longUrl: string) => {
      setIsShortening(true);
      try {
        const spooMeUrl = 'https://spoo.me/';
        const options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            url: longUrl,
          }),
        };

        const response = await fetch(spooMeUrl, options);
        if (response.ok) {
          const data = await response.json();
          if (data && data.short_url) {
            setShortUrl(data.short_url);
          } else {
            throw new Error('Invalid response from shortener API');
          }
        } else {
          throw new Error(`Failed to shorten URL, status: ${response.status}`);
        }
      } catch (error) {
        console.error('URL shortening failed, falling back to long URL:', error);
        setShortUrl(window.location.href); // Fallback to the long URL
      } finally {
        setIsShortening(false);
      }
    };

    shortenUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };
  
  const shareUrl = shortUrl || window.location.href;
  const shareText = "Listen to this stream!";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] animate-fade-in">
        <AudioPlayer streamUrl={streamUrl} logoUrl={logoUrl} />
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <a
                href={isShortening ? '#' : whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full transition-all duration-300 transform ${isShortening ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'}`}
                aria-disabled={isShortening}
            >
                <WhatsappIcon className="w-5 h-5"/>
                <span className="font-medium">WhatsApp</span>
            </a>
            <a
                href={isShortening ? '#' : telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                 className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full transition-all duration-300 transform ${isShortening ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'}`}
                 aria-disabled={isShortening}
            >
                <TelegramIcon className="w-5 h-5"/>
                <span className="font-medium">Telegram</span>
            </a>
            <button
                onClick={handleCopy}
                disabled={isShortening}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
            >
                {isShortening ? (
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                ) : (
                    <CopyIcon className="w-5 h-5"/>
                )}
                <span className="font-medium">
                    {isShortening ? 'Generating...' : (isCopied ? 'Copied!' : 'Copy Link')}
                </span>
            </button>
        </div>
    </div>
  );
};