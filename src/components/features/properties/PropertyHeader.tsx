'use client';

import { ChevronLeft, Heart, Share2 } from 'lucide-react';

interface PropertyHeaderProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

export function PropertyHeader({ 
  isFavorite, 
  onToggleFavorite, 
  onShare,
  onBack 
}: PropertyHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Funcionalidad por defecto de compartir
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleFavorite}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              Guardar
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}