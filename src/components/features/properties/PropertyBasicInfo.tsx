'use client';

import { useState } from 'react';
import {Star, MapPin, Heart, Share2} from 'lucide-react';

interface PropertyBasicInfoProps {
  title: string;
  city: string;
  stateRegion: string;
  country: string;
  averageRating?: number;
  totalReviews?: number;
  className?: string;
}

export function PropertyBasicInfo({
  title,
  city,
  stateRegion,
  country,
  averageRating,
  totalReviews,
  className = ''
}: PropertyBasicInfoProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const onToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title} - ${city}, ${country}`,
        url: window.location.href,
      }).catch(() => {});
    }
  };
  const formatRating = (rating?: number) => {
    return typeof rating === 'number' ? rating.toFixed(1) : '0.0';
  };

  const formatReviewCount = (count?: number) => {
    return typeof count === 'number' ? count : 0;
  };

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {title || 'Titulo no disponible'}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onToggleFavorite}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors underline"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden sm:inline">Guardar</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{formatRating(averageRating)}</span>
          <span>({formatReviewCount(totalReviews)} resenas)</span>
        </div>

        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{city}, {stateRegion}, {country}</span>
        </div>
      </div>
    </div>
  );
}