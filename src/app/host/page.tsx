import React from "react";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Plus
} from "lucide-react";

export default function HostPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Anfitrión
        </h1>
        <p className="text-gray-600">
          Bienvenido de vuelta. Aquí tienes un resumen de tu actividad como anfitrión.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos del mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$2,450</p>
              <p className="text-sm text-green-600 mt-1">+12% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reservas activas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
              <p className="text-sm text-blue-600 mt-1">3 próximas llegadas</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
              <p className="text-sm text-purple-600 mt-1">Todas activas</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificación</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">4.8</p>
              <p className="text-sm text-yellow-600 mt-1">245 reseñas</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/host/properties"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Agregar propiedad</h3>
              <p className="text-sm text-gray-600">Crea un nuevo listado</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </Link>

          <Link
            href="/host/bookings"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Ver reservas</h3>
              <p className="text-sm text-gray-600">Gestiona el calendario</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          </Link>

          <Link
            href="/host/analytics"
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Ver análisis</h3>
              <p className="text-sm text-gray-600">Métricas y estadísticas</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actividad reciente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Nueva reserva confirmada</p>
              <p className="text-sm text-gray-600">María González - Apartamento Centro, 25-28 Oct</p>
            </div>
            <span className="text-sm text-gray-500">Hace 2 horas</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Nueva reseña recibida</p>
              <p className="text-sm text-gray-600">5 estrellas de Carlos Mendez - Casa Playa</p>
            </div>
            <span className="text-sm text-gray-500">Ayer</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Pago procesado</p>
              <p className="text-sm text-gray-600">$350 transferido a tu cuenta</p>
            </div>
            <span className="text-sm text-gray-500">Hace 3 días</span>
          </div>
        </div>
      </div>
    </div>
  );
}