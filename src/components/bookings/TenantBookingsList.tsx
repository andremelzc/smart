"use client";

import React from "react";

import { useTenantBookings } from "@/src/hooks/useTenantBookings";

import { bookingService } from "@/src/services/booking.service";

import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function TenantBookingsList() {
  const { bookings, loading, error, refreshBookings } = useTenantBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

        <span className="ml-2 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />

          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar reservas
            </h3>

            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={refreshBookings}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />

        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No tienes reservas
        </h3>

        <p className="text-gray-600">
          Cuando hagas una reserva, aparecera aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>

        <span className="text-sm text-gray-600">
          {bookings.length} reserva{bookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  {booking.title}
                </h3>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-1 h-4 w-4" />

                  {bookingService.getFullAddress(booking)}
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${bookingService.getStatusColor(booking.status)}`}
              >
                {bookingService.translateStatus(booking.status)}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />

                <div>
                  <p className="font-medium">Check-in</p>

                  <p>{bookingService.formatDate(booking.checkinDate)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />

                <div>
                  <p className="font-medium">Check-out</p>

                  <p>{bookingService.formatDate(booking.checkoutDate)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="mr-2 h-4 w-4 text-gray-400" />

                <div>
                  <p className="font-medium">Huespedes</p>

                  <p>
                    {booking.guestCount} persona
                    {booking.guestCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="mr-2 h-4 w-4 text-gray-400" />

                <div>
                  <p className="font-medium">Total</p>

                  <p className="font-semibold text-green-600">
                    {bookingService.formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="mr-2 h-4 w-4 text-gray-400" />

                <span>
                  Anfitrion: {bookingService.getHostFullName(booking)}
                </span>
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <span>
                  {bookingService.calculateStayDuration(
                    booking.checkinDate,
                    booking.checkoutDate
                  )}{" "}
                  dia
                  {bookingService.calculateStayDuration(
                    booking.checkinDate,
                    booking.checkoutDate
                  ) !== 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>

            {booking.hostNote && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-blue-600" />

                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Nota del anfitrion:
                    </p>

                    <p className="text-sm text-blue-800">{booking.hostNote}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
