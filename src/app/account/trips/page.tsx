"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Filter,
  ChevronRight,
  Plane,
  Hotel
} from "lucide-react";

// Datos de ejemplo para los viajes
const mockTrips = [
  {
    id: 1,
    destination: "París, Francia",
    property: "Apartamento en el centro histórico",
    dates: "15 - 22 Mar 2024",
    status: "completed",
    rating: 5,
    price: "$850",
    image: "/api/placeholder/300/200",
    host: "Marie Dubois"
  },
  {
    id: 2,
    destination: "Barcelona, España", 
    property: "Casa moderna cerca de la playa",
    dates: "8 - 15 Jun 2024",
    status: "completed",
    rating: 4,
    price: "$1,200",
    image: "/api/placeholder/300/200",
    host: "Carlos García"
  },
  {
    id: 3,
    destination: "Roma, Italia",
    property: "Villa con vista al Coliseo",
    dates: "20 - 27 Dic 2024",
    status: "upcoming",
    rating: null,
    price: "$2,100",
    image: "/api/placeholder/300/200",
    host: "Giuseppe Romano"
  },
  {
    id: 4,
    destination: "Tokio, Japón",
    property: "Apartamento tradicional en Shibuya",
    dates: "10 - 17 Feb 2025",
    status: "upcoming",
    rating: null,
    price: "$1,800",
    image: "/api/placeholder/300/200",
    host: "Yuki Tanaka"
  }
];

const statusConfig = {
  completed: {
    label: "Completado",
    color: "bg-green-100 text-green-800",
    icon: "✓"
  },
  upcoming: {
    label: "Próximo",
    color: "bg-blue-100 text-blue-800", 
    icon: "→"
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: "✕"
  }
};

export default function TripsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const filteredTrips = mockTrips.filter(trip => {
    if (selectedFilter === "all") return true;
    return trip.status === selectedFilter;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis viajes</h1>
        <p className="text-gray-600 mt-1">Historial completo de tus reservas y experiencias</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Viajes totales</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Hotel className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Calificación promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "completed", label: "Completados" },
            { key: "upcoming", label: "Próximos" },
            { key: "cancelled", label: "Cancelados" }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay viajes en esta categoría
            </h3>
            <p className="text-gray-600">
              Intenta cambiar el filtro o hacer una nueva reserva
            </p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const status = statusConfig[trip.status as keyof typeof statusConfig];
            
            return (
              <div key={trip.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Trip Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Hotel className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Trip Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {trip.destination}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {trip.property}
                          </p>
                        </div>
                        
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {trip.dates}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Anfitrión: {trip.host}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {trip.rating && (
                            <div className="flex items-center gap-1">
                              {renderStars(trip.rating)}
                              <span className="text-sm text-gray-600 ml-1">
                                ({trip.rating}/5)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-gray-900">
                            {trip.price}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Ver detalles
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Empty State for no trips */}
      {mockTrips.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            ¡Aún no tienes viajes!
          </h3>
          <p className="text-gray-600 mb-6">
            Explora destinos increíbles y reserva tu primera experiencia
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explorar destinos
          </button>
        </div>
      )}
    </div>
  );
}