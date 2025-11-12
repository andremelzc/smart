'use client';

import React, { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/src/components/ui/Button';
import { Loader2 } from 'lucide-react';

// Importa tu servicio de disponibilidad
import { 
  hostAvailabilityService, 
  SetAvailabilityParams,
  HostCalendarDay
} from '@/src/services/host-availability.service';

type Props = {
  propertyId: string;
};

// Define el tipo de respuesta del calendario (adaptado para el componente)
type CalendarDay = {
  date: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance' | 'special';
  pricePerNight?: number;
};

// Define el tipo de respuesta de setAvailability
type SetAvailabilityResponse = {
  success: boolean;
  message?: string;
};

// Helper para convertir Date a string YYYY-MM-DD
const toISODate = (date: Date): string => date.toISOString().split('T')[0];

export function AvailabilityCalendar({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // --- QUERY (GET) ---
  // Obtiene los días del calendario con su estado
  const { data: calendarDays, isLoading: isLoadingCalendar } = useQuery<CalendarDay[]>({
    queryKey: ['hostCalendar', propertyId, currentMonth.getFullYear(), currentMonth.getMonth()],
    queryFn: async () => {
      const result = await hostAvailabilityService.getCalendar(
        propertyId,
        currentMonth.getMonth(), // 0-11
        currentMonth.getFullYear()
      );
      
      // Mapear HostCalendarDay a CalendarDay
      return (result || []).map((day: HostCalendarDay): CalendarDay => ({
        date: day.date,
        status: day.reason, // 'available' | 'booked' | 'blocked' | 'maintenance'
        pricePerNight: day.price ?? undefined,
      }));
    },
  });

  // Array seguro de días del calendario
  const days: CalendarDay[] = calendarDays ?? [];

  // --- MUTATION (POST) ---
  // Actualiza la disponibilidad de un rango de fechas
  const { mutate: setAvailability, isPending: isSaving } = useMutation<
    SetAvailabilityResponse,
    Error,
    SetAvailabilityParams
  >({
    mutationFn: async (params: SetAvailabilityParams) => {
      return await hostAvailabilityService.setAvailability(propertyId, params);
    },

    onSuccess: (data: SetAvailabilityResponse) => {
      if (data.success) {
        // Refresca el calendario
        queryClient.invalidateQueries({ 
          queryKey: ['hostCalendar', propertyId] 
        });
        setSelectedRange(undefined);
        alert('¡Calendario actualizado correctamente!');
      } else {
        throw new Error('Error desconocido al guardar');
      }
    },
    onError: (error: Error) => {
      alert(`Error al guardar: ${error.message}`);
    }
  });

  // --- Estilos para los días según su estado ---
  const modifiers = {
    booked: (day: Date): boolean => {
      return days.some((d) => d.date === toISODate(day) && d.status === 'booked');
    },
    blocked: (day: Date): boolean => {
      return days.some((d) => 
        d.date === toISODate(day) && (d.status === 'blocked' || d.status === 'maintenance')
      );
    },
    special: (day: Date): boolean => {
      return days.some((d) => d.date === toISODate(day) && d.status === 'special');
    },
  };

  const modifiersClassNames = {
    booked: 'day-booked',
    blocked: 'day-blocked',
    special: 'day-special',
  };

  // --- Handlers para guardar cambios ---
  const handleSave = (kind: 'blocked' | 'maintenance' | 'special'): void => {
    if (!selectedRange?.from || !selectedRange?.to) {
      alert('Por favor selecciona un rango de fechas');
      return;
    }

    let price: number | null = null;
    
    // Si es precio especial, pedir el monto
    if (kind === 'special') {
      const priceInput = prompt("Ingresa el precio por noche (ej: 150.50):");
      if (!priceInput) return; // Usuario canceló
      
      price = parseFloat(priceInput);
      if (isNaN(price) || price <= 0) {
        alert('Precio inválido. Debe ser un número mayor a 0');
        return;
      }
    }

    // Ejecutar la mutación
    setAvailability({
      startDate: toISODate(selectedRange.from),
      endDate: toISODate(selectedRange.to),
      kind: kind,
      pricePerNight: price,
    });
  };

  const isLoading = isLoadingCalendar || isSaving;

  return (
    <div className="space-y-6">
      {/* Estilos CSS inline para los días */}
      <style>{`
        .day-booked { 
          background-color: #fecaca; 
          color: #b91c1c; 
          text-decoration: line-through; 
        }
        .day-blocked { 
          background-color: #e5e7eb; 
          color: #4b5563; 
          text-decoration: line-through; 
        }
        .day-special { 
          background-color: #d1fae5; 
          color: #065f46; 
          font-weight: bold; 
          border: 2px solid #065f46; 
        }
      `}</style>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-600"></div>
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 border border-gray-600"></div>
          <span>Bloqueado/Mantenimiento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border-2 border-green-700"></div>
          <span>Precio Especial</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="flex justify-center">
        <DayPicker
          locale={es}
          mode="range"
          numberOfMonths={2}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={selectedRange}
          onSelect={setSelectedRange}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          disabled={isLoading}
        />
      </div>

      {/* Panel de acciones cuando hay fechas seleccionadas */}
      {selectedRange?.from && selectedRange.to && (
        <div className="mt-4 p-6 border rounded-lg shadow-sm bg-card">
          <h4 className="font-semibold text-lg mb-2">Editar Fechas Seleccionadas</h4>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Desde:</strong> {selectedRange.from.toLocaleDateString('es-ES')} <br />
            <strong>Hasta:</strong> {selectedRange.to.toLocaleDateString('es-ES')}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleSave('blocked')} 
              disabled={isLoading} 
              variant="primary"
            >
              Bloquear
            </Button>
            <Button 
              onClick={() => handleSave('special')} 
              disabled={isLoading}
              variant="primary"
            >
              Poner Precio Especial
            </Button>
            <Button 
              onClick={() => handleSave('maintenance')} 
              disabled={isLoading} 
              variant="ghost"
            >
              Mantenimiento
            </Button>
            <Button 
              onClick={() => setSelectedRange(undefined)} 
              disabled={isLoading} 
              variant="ghost"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}