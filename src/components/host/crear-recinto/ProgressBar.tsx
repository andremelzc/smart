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
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Tipo: <Home className="h-6 w-6" />,

  Ubicacion: <MapPinPen className="h-6 w-6" />,

  Detalles: <BedDouble className="h-6 w-6" />,

  Servicios: <HandPlatter className="h-6 w-6" />,

  Fotos: <Camera className="h-6 w-6" />,

  Titulo: <Type className="h-6 w-6" />,

  Precio: <CircleDollarSign className="h-6 w-6" />,

  Reglas: <ListChecks className="h-6 w-6" />,

  Resumen: <CheckCircle className="h-6 w-6" />,
};

interface ProgressBarProps {
  steps: string[];

  currentStep: number;

  onStepClick: (step: number) => void;

  isClickable: boolean;
}

export function ProgressBar({
  steps,
  currentStep,
  onStepClick,
  isClickable,
}: ProgressBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white px-8 py-4 shadow-md">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between">
          {steps.map((label, index) => {
            const stepNumber = index + 1;

            const isActive = stepNumber === currentStep;

            const isCompleted = stepNumber < currentStep;

            const baseClasses = "transition-colors duration-200";

            let stateClasses = "text-gray-400";

            if (isActive) stateClasses = "text-blue-vivid-700 font-bold";

            if (isCompleted) stateClasses = "text-gray-800";

            let cursorClass = "cursor-default";

            if (isClickable && (isCompleted || isActive)) {
              cursorClass = "cursor-pointer hover:text-blue-vivid-700";
            }

            return (
              <div
                key={stepNumber}
                className={`flex flex-col items-center px-2 ${cursorClass}`}
                onClick={() =>
                  isClickable && (isCompleted || isActive)
                    ? onStepClick(stepNumber)
                    : null
                }
              >
                <span
                  className={`${baseClasses} ${stateClasses} text-xs font-bold whitespace-nowrap`}
                >
                  {label}
                </span>

                <div className={`my-2 ${baseClasses} ${stateClasses}`}>
                  {iconMap[label] || <Home className="h-6 w-6" />}
                </div>

                <div
                  className={`h-3 w-3 rounded-full ${
                    isActive || isCompleted
                      ? "bg-blue-vivid-600"
                      : "bg-gray-200"
                  }`}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
          <div
            className="from-blue-vivid-500 to-blue-vivid-600 h-1 rounded-full bg-gradient-to-r transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
