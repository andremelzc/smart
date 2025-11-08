// src/components/host/crear-recinto/StepHeader.tsx
'use client';
import { useState } from 'react';
import { Info, X } from 'lucide-react'; 

interface StepHeaderProps {
  title: string;  
  subtitle: string;  
  helpText: string;
}

export function StepHeader({ title, subtitle, helpText }: StepHeaderProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    // Contenedor general del encabezado
    <div className="flex flex-col gap-4 mb-8">
      
      <div className="flex justify-between items-center p-4 bg-blue-light-700 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-white">
          {title}
        </h1>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
          aria-label="Mostrar/Ocultar ayuda"
        >
          {showHelp ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </button>
      </div>

      {showHelp && (
        <div className="p-4 border border-blue-light-200 bg-blue-light-0 rounded-lg">
          <p className="text-md text-blue-light-700">{helpText}</p>
        </div>
      )}

      <p className="text-lg text-gray-dark-500">
        {subtitle}
      </p>
    </div>
  );
}