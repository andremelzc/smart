'use client';

import { useState } from 'react';
import { 
  Wifi, 
  Car, 
  Tv, 
  AirVent, 
  Coffee, 
  Shield, 
  Waves, 
  Dumbbell 
} from 'lucide-react';

interface Amenity {
  name: string;
  icon?: string;
}

interface PropertyAmenitiesProps {
  amenities: Amenity[];
  className?: string;
}

// Mapeo de iconos para amenities - puede ser extendido fácilmente
const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  tv: Tv,
  ac: AirVent,
  air_conditioning: AirVent,
  kitchen: Coffee,
  security: Shield,
  pool: Waves,
  gym: Dumbbell,
  // Agregar más mapeos según sea necesario
};

export function PropertyAmenities({ 
  amenities, 
  className = '' 
}: PropertyAmenitiesProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  if (!amenities || amenities.length === 0) {
    return null;
  }

  const visibleAmenities = showAllAmenities 
    ? amenities 
    : amenities.slice(0, 6);

  const toggleShowAll = () => {
    setShowAllAmenities(!showAllAmenities);
  };

  return (
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4">Lo que ofrece este lugar</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleAmenities.map((amenity, index) => {
          const IconComponent = amenityIcons[amenity.icon || ''] || Wifi;
          return (
            <div key={index} className="flex items-center gap-3">
              <IconComponent className="w-5 h-5 text-gray-600" />
              <span>{typeof amenity.name === 'string' ? amenity.name : ''}</span>
            </div>
          );
        })}
      </div>
      
      {amenities.length > 6 && (
        <button
          onClick={toggleShowAll}
          className="mt-4 text-blue-light-500 font-medium hover:underline transition-colors"
        >
          {showAllAmenities 
            ? 'Mostrar menos' 
            : `Mostrar los ${amenities.length} servicios`
          }
        </button>
      )}
    </div>
  );
}