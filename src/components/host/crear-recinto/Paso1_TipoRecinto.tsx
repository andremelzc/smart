// src/components/host/crear-recinto/Paso1_TipoRecinto.tsx
import { Home, Building, MountainSnow, BedDouble } from 'lucide-react';
import { StepHeader } from './StepHeader';

const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa', description: 'Una propiedad completa.', icon: <Home className="w-10 h-10" /> },
  { id: 'departamento', label: 'Departamento', description: 'Un espacio en un edificio.', icon: <Building className="w-10 h-10" /> },
  { id: 'cabana', label: 'Cabana', description: 'Una casa rustica.', icon: <MountainSnow className="w-10 h-10" /> },
  { id: 'habitacion', label: 'Habitacion privada', description: 'Una habitacion en un espacio compartido.', icon: <BedDouble className="w-10 h-10" /> },
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
    <div className="flex flex-col gap-4">
      <StepHeader
        title="Que tipo de recinto vas a publicar?"
        subtitle="Elija la opcion que mejor describa su espacio."
        helpText="Haga clic en una de las tarjetas para seleccionar el tipo de propiedad. Al finalizar, presione 'Siguiente'."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROPERTY_TYPES.map((prop) => {
          const isSelected = data.propertyType === prop.id;
          const baseStyle = 'rounded-2xl p-6 cursor-pointer transition-all flex flex-col gap-3 text-center items-center';
          const unselectedStyle = 'bg-blue-light-50 text-blue-light-700 border-2 border-blue-light-300 hover:border-blue-light-700 hover:bg-blue-light-100';
          const selectedStyle = 'bg-blue-vivid-600 text-white shadow-lg border-2 border-blue-vivid-700';
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