'use client';

import { Star, MapPin } from 'lucide-react';

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
  const formatRating = (rating?: number) => {
    return typeof rating === 'number' ? rating.toFixed(1) : '0.0';
  };

  const formatReviewCount = (count?: number) => {
    return typeof count === 'number' ? count : 0;
  };

  return (
    <div className={className}>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {title || 'Título no disponible'}
      </h1>
      
      <div className="flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{formatRating(averageRating)}</span>
          <span>({formatReviewCount(totalReviews)} reseñas)</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{city}, {stateRegion}, {country}</span>
        </div>
      </div>
    </div>
  );
}