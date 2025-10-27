import React from "react";
import { Calendar } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-blue-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reservas</h1>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-gray-700 text-lg font-medium">
              Contenido disponible para este escenario
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Funcionalidad de reservas en desarrollo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
