import React from "react";

import { Calendar } from "lucide-react";

export default function ReservasPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">Reservas</h1>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <p className="text-lg font-medium text-gray-700">
              Contenido disponible para este escenario
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Funcionalidad de reservas en desarrollo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
