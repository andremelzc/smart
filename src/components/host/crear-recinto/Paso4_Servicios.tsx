// src/components/host/crear-recinto/Paso4_Servicios.tsx
import { StepHeader } from './StepHeader';
import {
  Wifi, Wind, Car, Utensils, Waves, Dumbbell, Tv, Shirt,
  Thermometer, ShieldCheck, Siren, Baby, Dog, HelpCircle, Sparkles,
  Briefcase, Anvil, Bath, BatteryCharging, BedDouble, Flame, Croissant,
  FlameKindling, Cigarette, Sun, Snowflake, PartyPopper, Users,
  Accessibility, BellOff, WashingMachine
} from 'lucide-react';

interface StepProps {
  data: {
    amenities: string[];
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  '27.AC': <Wind className="w-7 h-7" />,
  '28.WIFI': <Wifi className="w-7 h-7" />,
  '29.TV': <Tv className="w-7 h-7" />,
  '30.KITCHEN': <Utensils className="w-7 h-7" />,
  '31.GYM': <Dumbbell className="w-7 h-7" />,
  '32.POOL': <Waves className="w-7 h-7" />,
  '33.WASHER': <WashingMachine className="w-7 h-7" />, 
  '34.DRYER': <Sparkles className="w-7 h-7" />, 
  '35.HEATING': <Thermometer className="w-7 h-7" />,
  '36.WORKSPACE': <Briefcase className="w-7 h-7" />,
  '37.HAIR_DRYER': <Sparkles className="w-7 h-7" />, 
  '38.IRON': <Anvil className="w-7 h-7" />,
  '39.JACUZZI': <Bath className="w-7 h-7" />,
  '40.PARKING': <Car className="w-7 h-7" />, 
  '41.EV_CHARGER': <BatteryCharging className="w-7 h-7" />,
  '42.CRIB': <Baby className="w-7 h-7" />, 
  '43.KING_BED': <BedDouble className="w-7 h-7" />,
  '44.BBQ': <Flame className="w-7 h-7" />, 
  '45.BREAKFAST': <Croissant className="w-7 h-7" />,
  '46.FIREPLACE': <FlameKindling className="w-7 h-7" />,
  '47.SMOKING': <Cigarette className="w-7 h-7" />, 
  '48.BEACHFRONT': <Sun className="w-7 h-7" />, 
  '49.COAST': <Waves className="w-7 h-7" />,
  '50.SKI_ACCESS': <Snowflake className="w-7 h-7" />,
  '51.SMOKE_DETECTOR': <Siren className="w-7 h-7" />,
  '52.CO_DETECTOR': <ShieldCheck className="w-7 h-7" />, 
  '53.PETS_ALLOWED': <Dog className="w-7 h-7" />,
  '54.SMOKING_ALLOWED': <Cigarette className="w-7 h-7" />, 
  '55.PARTIES_ALLOWED': <PartyPopper className="w-7 h-7" />,
  '56.FAMILY_FRIENDLY': <Users className="w-7 h-7" />,
  '57.BABY_FRIENDLY': <Baby className="w-7 h-7" />,
  '58.WHEELCHAIR_ACCESSIBLE': <Accessibility className="w-7 h-7" />,
  '59.PARKING_AVAILABLE': <Car className="w-7 h-7" />, 
  '60.QUIET_HOURS': <BellOff className="w-7 h-7" />,
  'default': <HelpCircle className="w-7 h-7" /> 
};


const amenityGroups = [
  {
    title: "Servicios Destacados",
    amenities: [
      { id: '28.WIFI', name: 'Wifi' },
      { id: '27.AC', name: 'Aire acondicionado' },
      { id: '30.KITCHEN', name: 'Cocina' },
      { id: '40.PARKING', name: 'Estacionamiento gratuito' },
      { id: '32.POOL', name: 'Piscina' },
      { id: '39.JACUZZI', name: 'Jacuzzi' },
      { id: '29.TV', name: 'Televisor' },
      { id: '33.WASHER', name: 'Lavadora' },
      { id: '31.GYM', name: 'Gimnasio' },
    ]
  },
  {
    title: "Comodidades del Hogar",
    amenities: [
      { id: '35.HEATING', name: 'Calefacción' },
      { id: '36.WORKSPACE', name: 'Zona de trabajo' },
      { id: '46.FIREPLACE', name: 'Chimenea interior' },
      { id: '44.BBQ', name: 'Parrilla' },
      { id: '45.BREAKFAST', name: 'Desayuno' },
      { id: '34.DRYER', name: 'Secadora' },
      { id: '37.HAIR_DRYER', name: 'Secadora de pelo' },
      { id: '38.IRON', name: 'Plancha' },
    ]
  },
  {
    title: "Familia y Mascotas",
    amenities: [
      { id: '56.FAMILY_FRIENDLY', name: 'Apto para familias' },
      { id: '57.BABY_FRIENDLY', name: 'Apto para bebés' },
      { id: '42.CRIB', name: 'Cuna' },
      { id: '53.PETS_ALLOWED', name: 'Se permiten mascotas' },
    ]
  },
  {
    title: "Ubicación y Entorno",
    amenities: [
      { id: '48.BEACHFRONT', name: 'Linea de playa' },
      { id: '49.COAST', name: 'Costa' },
      { id: '50.SKI_ACCESS', name: 'Acceso a pistas de esqui' },
    ]
  },
  {
    title: "Seguridad y Accesibilidad",
    amenities: [
      { id: '51.SMOKE_DETECTOR', name: 'Detector de humo' },
      { id: '52.CO_DETECTOR', name: 'Detector de monóxido' },
      { id: '58.WHEELCHAIR_ACCESSIBLE', name: 'Acceso para silla de ruedas' },
    ]
  },
  {
    title: "Extras",
    amenities: [
      { id: '41.EV_CHARGER', name: 'Cargador EV' },
      { id: '43.KING_BED', name: 'Cama King' },
      { id: '59.PARKING_AVAILABLE', name: 'Hay estacionamiento' },
      { id: '54.SMOKING_ALLOWED', name: 'Se permite fumar' },
      { id: '47.SMOKING', name: 'Apto para fumadores' },
      { id: '55.PARTIES_ALLOWED', name: 'Se permiten fiestas' },
      { id: '60.QUIET_HOURS', name: 'Horario de silencio' },
    ]
  }
];

export function Paso4_Servicios({ data, updateData }: StepProps) {

  const handleToggleAmenity = (amenityId: string) => {
    const currentAmenities = data.amenities;
    
    if (currentAmenities.includes(amenityId)) {
      updateData({
        amenities: currentAmenities.filter(id => id !== amenityId)
      });
    } else {
      updateData({
        amenities: [...currentAmenities, amenityId]
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="¿Qué servicios ofrece tu recinto?"
        subtitle="Selecciona todos los servicios que pones a disposición de tus huéspedes."
        helpText="Estos son los filtros más usados por los huéspedes. Asegúrate de marcar solo lo que realmente ofreces para gestionar bien sus expectativas."
      />

      <div className="flex flex-col gap-10">
        
        {amenityGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-4">
            
            <h2 className="text-2xl font-semibold text-blue-light-700">
              {group.title}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {group.amenities.map((amenity) => {
                const isSelected = data.amenities.includes(amenity.id);

                const baseStyle = 
                  'rounded-2xl p-6 cursor-pointer transition-all flex flex-col gap-3 items-center justify-center border-2 h-full';
                
                const unselectedStyle = 
                  'bg-blue-light-50 text-blue-light-800 border-blue-light-200 hover:border-blue-light-700 hover:bg-blue-light-100';
                
                const selectedStyle = 
                  'bg-blue-vivid-600 text-white shadow-lg border-blue-vivid-700';

                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => handleToggleAmenity(amenity.id)}
                    className={`${baseStyle} ${
                      isSelected ? selectedStyle : unselectedStyle
                    }`}
                  >
                    {amenityIcons[amenity.id] || amenityIcons['default']}
                    
                    <span className="text-lg font-semibold">
                      {amenity.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}