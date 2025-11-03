// src/components/host/crear-recinto/ProgressBar.tsx
import {
  Home,
  MapPinPen,
  BedDouble,
  HandPlatter,
  Camera,
  Type,
  CircleDollarSign,
  ListChecks,
  CheckCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  "Tipo": <Home className="w-6 h-6" />,
  "Ubicación": <MapPinPen className="w-6 h-6" />,
  "Detalles": <BedDouble className="w-6 h-6" />,
  "Servicios": <HandPlatter className="w-6 h-6" />,
  "Fotos": <Camera className="w-6 h-6" />,
  "Título": <Type className="w-6 h-6" />,
  "Precio": <CircleDollarSign className="w-6 h-6" />,
  "Reglas": <ListChecks className="w-6 h-6" />,
  "Resumen": <CheckCircle className="w-6 h-6" />
};

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
  isClickable: boolean;
}

export function ProgressBar({ steps, currentStep, onStepClick, isClickable }: ProgressBarProps) {
  return (
    // Fondo blanco que se pega arriba
    <div className="sticky top-0 bg-white shadow-md z-10 py-4 px-8">
      
      {/* --- (NUEVO CONTENEDOR) --- */}
      {/* Este div centra el contenido y le da el ancho MÁXIMO 
          que coincide con el 'page.tsx' */}
      <div className="max-w-5xl mx-auto">
        
        {/* Contenedor de los pasos (alineado al inicio) */}
        <div className="flex items-start justify-between">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            // Clases de estado (color)
            const baseClasses = "transition-colors duration-200";
            let stateClasses = "text-gray-400"; // Futuro
            if (isActive) stateClasses = "text-blue-vivid-500 font-bold";
            if (isCompleted) stateClasses = "text-gray-700";
            
            // Clases de cursor
            let cursorClass = "cursor-default";
            if (isClickable && (isCompleted || isActive)) {
               cursorClass = "cursor-pointer hover:text-blue-vivid-600";
            }

            return (
              <div
                key={stepNumber}
                className={`flex flex-col items-center px-2 ${cursorClass}`}
                onClick={() => (isClickable && (isCompleted || isActive)) ? onStepClick(stepNumber) : null}
              >
                {/* 1. ETIQUETA DE TEXTO (más pequeña) */}
                <span className={`${baseClasses} ${stateClasses} whitespace-nowrap text-xs font-medium`}>
                  {label}
                </span>
                
                {/* 2. ICONO (¡NUEVO!) */}
                <div className={`my-2 ${baseClasses} ${stateClasses}`}>
                  {iconMap[label] || <Home className="w-6 h-6" />}
                </div>

                {/* 3. PUNTO INDICADOR (Color 'vivid') */}
                <div 
                  className={`w-3 h-3 rounded-full ${
                    isActive || isCompleted ? 'bg-blue-vivid-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
        
        {/* --- (LÍNEA DE PROGRESO CON GRADIENTE) --- */}
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className="bg-gradient-to-r from-blue-vivid-500 to-blue-vivid-600 h-1 rounded-full transition-all duration-300" 
            style={{ 
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}