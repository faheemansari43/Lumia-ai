import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './Icon';

interface ImageCardProps {
  image: GeneratedImage;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `lumina-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative aspect-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
        {!isLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <span className="text-gray-600 text-sm">Loading...</span>
            </div>
        )}
      <img
        src={image.url}
        alt={image.prompt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-sm font-medium line-clamp-2 mb-3 drop-shadow-md">
          {image.prompt}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            {image.settings.resolution} • {image.settings.aspectRatio}
          </span>
          <button 
            onClick={handleDownload}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            title="Download"
          >
            <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
