// src/components/host/crear-recinto/StepHeader.tsx

"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

interface StepHeaderProps {
  title: string;
  subtitle: string;
  helpText: string;
}

export function StepHeader({ title, subtitle, helpText }: StepHeaderProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Header con caja azul */}
      <div className="flex justify-between items-center p-3 bg-blue-600 rounded-lg shadow-sm">
        <h1 className="text-lg font-semibold text-white">{title}</h1>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
          aria-label="Mostrar/Ocultar ayuda"
        >
          {showHelp ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </button>
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
          <p className="text-xs text-slate-700">{helpText}</p>
        </div>
      )}

      {/* Subtitle fuera de la caja */}
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}