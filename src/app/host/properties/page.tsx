"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/Button";
import { Plus, Edit3, Eye, Trash2, Search } from "lucide-react";

//TODO: Cambiar para que muestre las propiedades reales xd
interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  status: "active" | "inactive" | "pending";
  bookings: number;
  rating: number;
}

// Mock data - replace with actual API call

const mockProperties: Property[] = [
  {
    id: 1,

    title: "Casa Moderna con Vista al Mar",

    location: "Cartagena, Colombia",

    price: 150,

    status: "active",

    bookings: 24,

    rating: 4.8,
  },

  {
    id: 2,

    title: "Apartamento en el Centro Historico",

    location: "Medellin, Colombia",

    price: 85,

    status: "active",

    bookings: 18,

    rating: 4.6,
  },

  {
    id: 3,

    title: "Villa con Piscina Privada",

    location: "Bogota, Colombia",

    price: 220,

    status: "pending",

    bookings: 12,

    rating: 4.9,
  },
];

export default function PropertiesPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const [properties] = useState<Property[]>(mockProperties);

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Property["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";

      case "inactive":
        return "bg-red-100 text-red-800";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Property["status"]) => {
    switch (status) {
      case "active":
        return "Activa";

      case "inactive":
        return "Inactiva";

      case "pending":
        return "Pendiente";

      default:
        return "Desconocido";
    }
  };

  const handleEditProperty = (propertyId: number) => {
    router.push(`/host/properties/edit/${propertyId}`);
  };

  const handleViewProperty = (propertyId: number) => {
    router.push(`/properties/${propertyId}`);
  };

  const handleDeleteProperty = (propertyId: number) => {
    // TODO: Implement delete functionality
    console.log("Delete property:", propertyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600">
            Gestiona tus alojamientos y sus detalles
          </p>
        </div>

        <Button
          leftIcon={Plus}
          onClick={() => router.push("/host/properties/create")}
        >
          Nueva Propiedad
        </Button>
      </div>

      {/* Search and Filters */}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-light-500 focus:border-blue-light-500 w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-colors focus:ring-2"
            />
          </div>
        </div>
      </div>

      {/* Properties Grid */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Property Image Placeholder */}
            <div className="from-blue-light-100 to-blue-light-200 flex h-48 items-center justify-center bg-linear-to-br">
              <div className="text-blue-light-600 text-lg font-medium">
                Imagen de la Propiedad
              </div>
            </div>

            {/* Property Content */}

            <div className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                  {property.title}
                </h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    property.status
                  )}`}
                >
                  {getStatusText(property.status)}
                </span>
              </div>

              <p className="mb-4 text-sm text-gray-600">{property.location}</p>

              <div className="mb-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  ${property.price}
                  <span className="text-sm font-normal text-gray-600">
                    /noche
                  </span>
                </div>

                <div className="text-right text-sm text-gray-600">
                  <div> {property.rating}</div>
                  <div>{property.bookings} reservas</div>
                </div>
              </div>

              {/* Actions */}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={Edit3}
                  onClick={() => handleEditProperty(property.id)}
                  className="flex-1"
                >
                  Editar
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  iconOnly
                  leftIcon={Eye}
                  onClick={() => handleViewProperty(property.id)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  iconOnly
                  leftIcon={Trash2}
                  onClick={() => handleDeleteProperty(property.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}

      {filteredProperties.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-gray-400">
            <Plus size={48} className="mx-auto" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {searchTerm
              ? "No se encontraron propiedades"
              : "No tienes propiedades aun"}
          </h3>
          <p className="mb-6 text-gray-600">
            {searchTerm
              ? "Intenta con otros terminos de busqueda"
              : "Comienza publicando tu primera propiedad para empezar a recibir huespedes"}
          </p>
          {!searchTerm && (
            <Button
              leftIcon={Plus}
              onClick={() => router.push("/host/properties/publish")}
            >
              Publicar Primera Propiedad
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
