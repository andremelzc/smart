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
  Plus,
} from "lucide-react";

export default function HostPage() {
  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Panel de Anfitrion
        </h1>

        <p className="text-gray-600">
          Bienvenido de vuelta. Aqui tienes un resumen de tu actividad como
          anfitrion.
        </p>
      </div>

      {/* Quick Stats */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ingresos del mes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">$2,450</p>

              <p className="mt-1 text-sm text-green-600">
                +12% vs mes anterior
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Reservas activas
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">8</p>

              <p className="mt-1 text-sm text-blue-600">3 proximas llegadas</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">3</p>

              <p className="mt-1 text-sm text-purple-600">Todas activas</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calificacion</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">4.8</p>

              <p className="mt-1 text-sm text-yellow-600">245 reseñas</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Acciones rapidas
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/host/properties/create"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Agregar propiedad</h3>

              <p className="text-sm text-gray-600">Crea un nuevo listado</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          </Link>

          <Link
            href="/host/reservas"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-green-300 hover:bg-green-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Ver reservas</h3>

              <p className="text-sm text-gray-600">Gestiona el calendario</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
          </Link>

          <Link
            href="/host/analytics"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-purple-300 hover:bg-purple-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Ver analisis</h3>

              <p className="text-sm text-gray-600">Metricas y estadisticas</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Actividad reciente
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Users className="h-4 w-4 text-green-600" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Nueva reserva confirmada
              </p>

              <p className="text-sm text-gray-600">
                Maria Gonzalez - Apartamento Centro, 25-28 Oct
              </p>
            </div>

            <span className="text-sm text-gray-500">Hace 2 horas</span>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">Nueva resena recibida</p>

              <p className="text-sm text-gray-600">
                5 estrellas de Carlos Mendez - Casa Playa
              </p>
            </div>

            <span className="text-sm text-gray-500">Ayer</span>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">Pago procesado</p>

              <p className="text-sm text-gray-600">
                $350 transferido a tu cuenta
              </p>
            </div>

            <span className="text-sm text-gray-500">Hace 3 dias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
