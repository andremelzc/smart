"use client";

import { Hourglass, Clock } from "lucide-react";

interface EmptyStateProps {
  variant: 'host' | 'guest';
  filterType: 'all' | 'filtered';
  title?: string;
  subtitle?: string;
}

export function ReservationEmptyState({ 
  variant, 
  filterType,
  title,
  subtitle 
}: EmptyStateProps) {
  const Icon = variant === 'host' ? Hourglass : Clock;
  
  const defaultTitles = {
    host: {
      all: "No hay reservas",
      filtered: "No hay reservas bajo este criterio"
    },
    guest: {
      all: "No tienes reservas", 
      filtered: "No hay reservas bajo este filtro"
    }
  };

  const defaultSubtitles = {
    host: {
      all: "Cuando recibas solicitudes de reserva, aparecerán aquí.",
      filtered: "Ajusta los filtros para explorar otras ventanas de tiempo o estados."
    },
    guest: {
      all: "Cuando hagas una reserva, aparecerá aquí.",
      filtered: "Cambia el estado seleccionado o realiza una nueva reserva para verla aquí."
    }
  };

  const displayTitle = title || defaultTitles[variant][filterType];
  const displaySubtitle = subtitle || defaultSubtitles[variant][filterType];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <Icon className="h-10 w-10 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-900">
        {displayTitle}
      </h3>
      <p className="text-sm text-gray-600">
        {displaySubtitle}
      </p>
    </div>
  );
}