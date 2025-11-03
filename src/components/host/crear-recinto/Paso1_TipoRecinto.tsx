// src/components/host/crear-recinto/Paso1_TipoRecinto.tsx
import { Home, Building, MountainSnow, BedDouble } from 'lucide-react';

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', description: 'Una propiedad completa.', icon: <Home className="w-10 h-10" /> },
  { id: 'departamento', label: 'Departamento', description: 'Un espacio en un edificio.', icon: <Building className="w-10 h-10" /> },
  { id: 'cabaña', label: 'Cabaña', description: 'Una casa rústica.', icon: <MountainSnow className="w-10 h-10" /> },
  { id: 'habitacion', label: 'Habitación privada', description: 'Una habitación en un espacio compartido.', icon: <BedDouble className="w-10 h-10" /> },
];

interface StepProps {
  data: {
    propertyType: string;
  };
  updateData: (data: { propertyType: string }) => void;
}

export function Paso1_TipoRecinto({ data, updateData }: StepProps) {
  
  const handleSelectType = (typeId: string) => {
    updateData({ propertyType: typeId });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-light-800">
          ¿Qué tipo de recinto vas a publicar?
        </h1>
        <p className="mt-2 text-lg text-gray-dark-500">
          Elige la opción que mejor describa tu espacio.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROPERTY_TYPES.map((prop) => {
          const isSelected = data.propertyType === prop.id;
          const baseStyle = 'rounded-2xl p-6 cursor-pointer transition-all flex flex-col gap-3 text-center items-center';
          const unselectedStyle = 'bg-blue-light-50 text-blue-light-700 border-2 border-blue-light-300 hover:border-blue-light-500 hover:bg-blue-light-100';
          const selectedStyle = 'bg-blue-vivid-600 text-white shadow-lg border border-blue-vivid-500';
          return (
            <button
              type="button"
              key={prop.id}
              onClick={() => handleSelectType(prop.id)}
              className={`${baseStyle} ${ isSelected ? selectedStyle : unselectedStyle }`}
            >
              {prop.icon}
              <span className="text-xl font-semibold">{prop.label}</span>
              <span className="text-sm">{prop.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}