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
    <div className="mb-6 flex flex-col gap-3">
      {/* Header con caja azul */}
      <div className="flex items-center justify-between rounded-lg bg-blue-600 p-3 shadow-sm">
        <h1 className="text-lg font-semibold text-white">{title}</h1>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/20 hover:text-white"
          aria-label="Mostrar/Ocultar ayuda"
        >
          {showHelp ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
        </button>
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-slate-700">{helpText}</p>
        </div>
      )}

      {/* Subtitle fuera de la caja */}
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
