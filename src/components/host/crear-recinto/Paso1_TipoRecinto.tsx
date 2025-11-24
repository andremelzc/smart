// src/components/host/crear-recinto/Paso1_TipoRecinto.tsx

import { Home, Building, MountainSnow, BedDouble, CheckCircle } from "lucide-react";
import { StepHeader } from "./StepHeader";
import { useEffect, useState } from "react";

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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (data.propertyType) {
      timer = setTimeout(() => {
        setShowSuccess(true);
      }, 0);

      hideTimer = setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    } else {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 0);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [data.propertyType]);

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

      <div className="mt-2 min-h-[50px] transition-all duration-300">
        {!data.propertyType && (
          <div className="p-3 border border-red-200 bg-red-50 rounded-lg text-center animate-in fade-in slide-in-from-top-1 duration-300">
            <p className="text-sm text-red-700 font-medium">
              Para continuar con el siguiente paso, seleccione una de los tipos de recinto.
            </p>
          </div>
        )}

        {data.propertyType && showSuccess && (
          <div className="p-3 border border-green-200 bg-green-50 rounded-lg text-center flex items-center justify-center gap-2 animate-in zoom-in fade-in duration-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              ¡Opción seleccionada correctamente!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}