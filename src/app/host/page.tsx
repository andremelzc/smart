"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  Star,
  ArrowRight,
  Plus,
  Loader2,
  Receipt,
} from "lucide-react";
import { useHostDashboard } from "@/src/hooks/useHostDashboard";

export default function HostPage() {
  const { stats, recentActivity, isLoading, error } = useHostDashboard();

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha relativa
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  // Icono según tipo de actividad
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-green-100';
      case 'review':
        return 'bg-yellow-100';
      case 'payment':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Panel de Anfitrión
        </h1>
        <p className="text-gray-600">
          Bienvenido de vuelta. Aquí tienes un resumen de tu actividad como anfitrión.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos Totales */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Ingresos totales
              </p>
              {isLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    {stats?.totalBookings || 0} reserva{stats?.totalBookings !== 1 ? 's' : ''}
                  </p>
                </>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Reservas Activas */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Reservas activas
              </p>
              {isLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.activeBookings || 0}
                  </p>
                  <p className="mt-1 text-sm text-blue-600">
                    {stats?.totalBookings || 0} totales
                  </p>
                </>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Propiedades */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              {isLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.totalProperties || 0}
                  </p>
                  <p className="mt-1 text-sm text-purple-600">
                    {stats?.totalProperties === 0 ? 'Crea tu primera' : 'Todas activas'}
                  </p>
                </>
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Calificación</p>
              {isLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats?.averageRating || 0}
                  </p>
                  <p className="mt-1 text-sm text-yellow-600">
                    {stats?.totalReviews || 0} reseña{stats?.totalReviews !== 1 ? 's' : ''}
                  </p>
                </>
              )}
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
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/host/properties/create"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
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
            href="/host/bookings"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:bg-green-50"
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
            href="/host/properties"
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-purple-300 hover:bg-purple-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Mis propiedades</h3>
              <p className="text-sm text-gray-600">Administra tus listados</p>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Metric Cards - Ticket Promedio */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              🎫 Ticket Promedio
            </h3>
            <Receipt className="h-5 w-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Cargando...</span>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.averageTicket || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Valor promedio por reserva
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              📅 Tasa de Ocupación
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Cargando...</span>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.activeBookings || 0} / {stats?.totalProperties || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Reservas activas / Propiedades totales
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Actividad reciente
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              No hay actividad reciente para mostrar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={`${activity.activityType}-${activity.activityId}-${index}`}
                className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityBgColor(activity.activityType)}`}
                >
                  {getActivityIcon(activity.activityType)}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>

                <span className="text-sm text-gray-500">
                  {formatRelativeDate(activity.activityDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
