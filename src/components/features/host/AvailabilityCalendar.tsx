"use client";

import React, { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/components/ui/Button";
import dynamic from "next/dynamic";
const ConfirmDialog = dynamic(
  () => import("@/src/components/ui/ConfirmDialog"),
  { ssr: false }
);
import ErrorBoundary from "@/src/components/ui/ErrorBoundary";
import Toast from "@/src/components/ui/Toast";
import { Loader2 } from "lucide-react";

// Importa tu servicio de disponibilidad
import {
  hostAvailabilityService,
  SetAvailabilityParams,
  HostCalendarDay,
} from "@/src/services/host-availability.service";

type Props = {
  propertyId: string;
};

// Define el tipo de respuesta del calendario (adaptado para el componente)
type CalendarDay = {
  date: string;
  status: "available" | "booked" | "blocked" | "maintenance" | "special";
  pricePerNight?: number;
};

// Define el tipo de respuesta de setAvailability
type SetAvailabilityResponse = {
  success: boolean;
  message?: string;
};

// Helper para convertir Date a string YYYY-MM-DD usando la fecha LOCAL
// Evita problemas de zona horaria que ocurren con toISOString()
const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function AvailabilityCalendar({ propertyId }: Props) {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // --- QUERY (GET) ---
  // Obtiene los días del calendario con su estado
  const { data: calendarDays, isLoading: isLoadingCalendar } = useQuery<
    CalendarDay[]
  >({
    // Include month and numberOfMonths in the key so the cache is specific
    queryKey: [
      "hostCalendar",
      propertyId,
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      2,
    ],
    queryFn: async () => {
      // Fetch availability for the current month and the next month (we render 2 months)
      const monthA = currentMonth.getMonth();
      const yearA = currentMonth.getFullYear();

      const nextMonthDate = new Date(currentMonth);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const monthB = nextMonthDate.getMonth();
      const yearB = nextMonthDate.getFullYear();

      const [resA, resB] = await Promise.all([
        hostAvailabilityService.getCalendar(propertyId, monthA, yearA),
        hostAvailabilityService.getCalendar(propertyId, monthB, yearB),
      ]);

      const combined = [...(resA || []), ...(resB || [])];

      // Mapear HostCalendarDay a CalendarDay
      return combined.map((day: HostCalendarDay): CalendarDay => ({
        date: day.date,
        status: day.reason,
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
          queryKey: ["hostCalendar", propertyId],
        });
        setSelectedRange(undefined);
        // show toast
        setToast({ message: "¡Calendario actualizado correctamente!", type: "success" });
      } else {
        throw new Error("Error desconocido al guardar");
      }
    },
    onError: (error: Error) => {
      setToast({ message: `Error al guardar: ${error.message}`, type: "error" });
    },
  });

  // --- MUTATION (DELETE) ---
  // Elimina un ajuste de disponibilidad
  const { mutate: removeAvailability, isPending: isRemoving } = useMutation<
    SetAvailabilityResponse,
    Error,
    { startDate: string; endDate: string }
  >({
    mutationFn: async ({ startDate, endDate }) => {
      return await hostAvailabilityService.removeAvailability(
        propertyId,
        startDate,
        endDate
      );
    },

    onSuccess: (data: SetAvailabilityResponse) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: ["hostCalendar", propertyId],
        });
        setSelectedRange(undefined);
        setToast({ message: "¡Ajuste eliminado correctamente!", type: "success" });
      } else {
        throw new Error("Error desconocido al eliminar");
      }
    },
    onError: (error: Error) => {
      setToast({ message: `Error al eliminar: ${error.message}`, type: "error" });
    },
  });

  // --- Estilos para los días según su estado ---
  const modifiers = {
    booked: (day: Date): boolean => {
      return days.some(
        (d) => d.date === toISODate(day) && d.status === "booked"
      );
    },
    blocked: (day: Date): boolean => {
      return days.some(
        (d) =>
          d.date === toISODate(day) &&
          (d.status === "blocked" || d.status === "maintenance")
      );
    },
    special: (day: Date): boolean => {
      return days.some(
        (d) => d.date === toISODate(day) && d.status === "special"
      );
    },
  };

  const modifiersClassNames = {
    booked: "day-booked",
    blocked: "day-blocked",
    special: "day-special",
  };

  // --- Handlers para guardar cambios ---
  const [pendingAction, setPendingAction] = React.useState<
    | { type: "save"; kind: "blocked" | "maintenance" | "special" }
    | { type: "remove" }
    | null
  >(null);

  const handleSave = (kind: "blocked" | "maintenance" | "special") => {
    if (!selectedRange?.from || !selectedRange?.to) {
      alert("Por favor selecciona un rango de fechas");
      return;
    }

    setPendingAction({ type: "save", kind });
  };

  // Manejador para eliminar ajuste de disponibilidad
  const handleRemove = () => {
    if (!selectedRange || !selectedRange.from || !selectedRange.to) {
      alert("Por favor selecciona un rango de fechas");
      return;
    }

    setPendingAction({ type: "remove" });
  };

  const isLoading = isLoadingCalendar || isSaving || isRemoving;

  const [toast, setToast] = React.useState<
    | { message: string; type: "success" | "error" | "info" }
    | null
  >(null);

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
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-red-600 bg-red-200"></div>
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-gray-600 bg-gray-300"></div>
          <span>Bloqueado/Mantenimiento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-green-700 bg-green-200"></div>
          <span>Precio Especial</span>
        </div>
      </div>

        {/* Confirm dialog for save/remove actions */}
        <ConfirmDialog
          open={pendingAction !== null}
          title={
            pendingAction?.type === "remove"
              ? "Eliminar ajuste de disponibilidad"
              : pendingAction?.type === "save" && pendingAction.kind === "special"
              ? "Confirmar precio especial"
              : "Confirmar ajuste de disponibilidad"
          }
          description={
            pendingAction?.type === "remove"
              ? "¿Estás seguro de que quieres eliminar este ajuste de disponibilidad?"
              : pendingAction?.type === "save"
              ? `Vas a ${
                  pendingAction.kind === "blocked"
                    ? "bloquear"
                    : pendingAction.kind === "maintenance"
                    ? "marcar como mantenimiento"
                    : "asignar un precio especial"
                } el rango seleccionado.`
              : undefined
          }
          requirePrice={pendingAction?.type === "save" && pendingAction.kind === "special"}
          confirmLabel={pendingAction?.type === "remove" ? "Eliminar" : "Guardar"}
          cancelLabel="Cancelar"
          onCancel={() => setPendingAction(null)}
          onConfirm={(data) => {
            if (!selectedRange || !selectedRange.from || !selectedRange.to) {
              setPendingAction(null);
              return;
            }

            if (pendingAction?.type === "remove") {
              removeAvailability({
                startDate: toISODate(selectedRange.from),
                endDate: toISODate(selectedRange.to),
              });
            } else if (pendingAction?.type === "save") {
              const price = data?.price ?? null;
              setAvailability({
                startDate: toISODate(selectedRange.from),
                endDate: toISODate(selectedRange.to),
                kind: pendingAction.kind,
                pricePerNight: pendingAction.kind === "special" ? price : null,
              });
            }

            setPendingAction(null);
          }}
        />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Calendario (envuelto en ErrorBoundary para detectar fallos de render) */}
      <div className="flex justify-center">
        <ErrorBoundary>
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
        </ErrorBoundary>
      </div>

      {/* Panel de acciones cuando hay fechas seleccionadas */}
      {selectedRange?.from && selectedRange.to && (
        <div className="bg-card mt-4 rounded-lg border p-6 shadow-sm">
          <h4 className="mb-2 text-lg font-semibold">
            Editar Fechas Seleccionadas
          </h4>
          <p className="text-muted-foreground mb-4 text-sm">
            <strong>Desde:</strong>{" "}
            {selectedRange.from.toLocaleDateString("es-ES")} <br />
            <strong>Hasta:</strong>{" "}
            {selectedRange.to.toLocaleDateString("es-ES")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleSave("blocked")}
              disabled={isLoading}
              variant="primary"
            >
              Bloquear
            </Button>
            <Button
              onClick={() => handleSave("special")}
              disabled={isLoading}
              variant="primary"
            >
              Poner Precio Especial
            </Button>
            <Button
              onClick={() => handleSave("maintenance")}
              disabled={isLoading}
              variant="ghost"
            >
              Mantenimiento
            </Button>
            <Button
              onClick={handleRemove}
              disabled={isLoading}
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
            >
              Eliminar Ajuste
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
