// src/components/host/crear-recinto/Paso1_TipoRecinto.tsx

import { Home, Building, MountainSnow, BedDouble } from "lucide-react";
import { StepHeader } from "./StepHeader";

const PROPERTY_TYPES = [
  {
    id: "casa",
    label: "Casa",
    description: "Una propiedad completa.",
    icon: <Home className="w-8 h-8" />,
  },
  {
    id: "departamento",
    label: "Departamento",
    description: "Un espacio en un edificio.",
    icon: <Building className="w-8 h-8" />,
  },
  {
    id: "cabana",
    label: "Cabaña",
    description: "Una casa rústica.",
    icon: <MountainSnow className="w-8 h-8" />,
  },
  {
    id: "habitacion",
    label: "Habitación privada",
    description: "Una habitación en un espacio compartido.",
    icon: <BedDouble className="w-8 h-8" />,
  },
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
        title="¿Qué tipo de recinto vas a publicar?"
        subtitle="Elija la opción que mejor describa su espacio."
        helpText="Haga click en una de las tarjetas para seleccionar el tipo de propiedad. Al finalizar, presione 'Siguiente'."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PROPERTY_TYPES.map((prop) => {
          const isSelected = data.propertyType === prop.id;

          const baseStyle =
            "rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col gap-2 text-center items-center";

          const unselectedStyle =
            "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-500 hover:shadow-md hover:scale-[1.02]";

          const selectedStyle =
            "bg-blue-600 text-white shadow-lg scale-[1.02]";

          return (
            <button
              type="button"
              key={prop.id}
              onClick={() => handleSelectType(prop.id)}
              className={`${baseStyle} ${
                isSelected ? selectedStyle : unselectedStyle
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {prop.icon}
              </div>
              <span className="text-base font-semibold">{prop.label}</span>
              <span className={`text-xs leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {prop.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}