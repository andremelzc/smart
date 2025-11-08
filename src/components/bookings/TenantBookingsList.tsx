"use client";

import React from 'react';
import { useTenantBookings } from '@/src/hooks/useTenantBookings';
import { bookingService } from '@/src/services/booking.service';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  User,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';

export function TenantBookingsList() {
  const { bookings, loading, error, refreshBookings } = useTenantBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar reservas</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refreshBookings}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
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
      <div className="text-center p-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes reservas</h3>
        <p className="text-gray-600">Cuando hagas una reserva, aparecera aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
        <span className="text-sm text-gray-600">
          {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div key={booking.bookingId} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {booking.title}
                </h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {bookingService.getFullAddress(booking)}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${bookingService.getStatusColor(booking.status)}`}>
                {bookingService.translateStatus(booking.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Check-in</p>
                  <p>{bookingService.formatDate(booking.checkinDate)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Check-out</p>
                  <p>{bookingService.formatDate(booking.checkoutDate)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Huespedes</p>
                  <p>{booking.guestCount} persona{booking.guestCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Total</p>
                  <p className="font-semibold text-green-600">
                    {bookingService.formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span>Anfitrion: {bookingService.getHostFullName(booking)}</span>
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <span>
                  {bookingService.calculateStayDuration(booking.checkinDate, booking.checkoutDate)} dia
                  {bookingService.calculateStayDuration(booking.checkinDate, booking.checkoutDate) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {booking.hostNote && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Nota del anfitrion:</p>
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