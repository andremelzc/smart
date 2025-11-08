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
  Dumbbell,
  WashingMachine,
  Flame,
  Laptop,
  Wind,
  Zap,
  Baby,
  Bed,
  ChefHat,
  Cigarette,
  MapPin,
  Mountain,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Volume2,
  Accessibility,
  ParkingCircle,
  Clock,
    PawPrintIcon,
} from 'lucide-react';

interface Amenity {
  name: string;
  icon?: string;
}

interface PropertyAmenitiesProps {
  amenities: Amenity[];
  className?: string;
}

// Mapeo de iconos para amenities basado en la API
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Amenidades basicas
  AC: AirVent,
  WIFI: Wifi,
  TV: Tv,
  KITCHEN: Coffee,
  GYM: Dumbbell,
  POOL: Waves,
  WASHER: WashingMachine,
  DRYER: Wind,
  HEATING: Flame,
  WORKSPACE: Laptop,
  HAIR_DRYER: Wind,
  IRON: Zap,
  JACUZZI: Waves,
  PARKING: Car,
  EV_CHARGER: Zap,
  CRIB: Baby,
  KING_BED: Bed,
  BBQ: ChefHat,
  BREAKFAST: Coffee,
  FIREPLACE: Flame,
  SMOKING: Cigarette,

  // Ubicacion
  BEACHFRONT: Waves,
  COAST: MapPin,
  SKI_ACCESS: Mountain,

  // Seguridad
  SMOKE_DETECTOR: ShieldCheck,
  CO_DETECTOR: ShieldAlert,

  // Politicas
  PETS_ALLOWED: PawPrintIcon,
  SMOKING_ALLOWED: Cigarette,
  PARTIES_ALLOWED: Volume2,
  FAMILY_FRIENDLY: Heart,
  BABY_FRIENDLY: Baby,
  WHEELCHAIR_ACCESSIBLE: Accessibility,
  PARKING_AVAILABLE: ParkingCircle,
  QUIET_HOURS: Clock,

  // Fallbacks para iconos antiguos (mantener compatibilidad)
  air_conditioning: AirVent,
  kitchen: Coffee,
  security: Shield,
  pool: Waves,
  gym: Dumbbell,
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
          // Safely get the icon, with fallback to Wifi if not found
          const iconKey = amenity.icon ? amenity.icon.toUpperCase() : '';
          const IconComponent = amenityIcons[iconKey] || Wifi;

          // Safely get the amenity name
          const amenityName = amenity.name || 'Amenidad';

          return (
            <div key={index} className="flex items-center gap-3">
              <IconComponent className="w-5 h-5 text-gray-600" />
              <span>{amenityName}</span>
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