'use client';

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/Button';
import { Plus, Edit3, Eye, Trash2, Search } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  status: 'active' | 'inactive' | 'pending';
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
    status: 'active',
    bookings: 24,
    rating: 4.8
  },
  {
    id: 2,
    title: "Apartamento en el Centro Histórico",
    location: "Medellín, Colombia",
    price: 85,
    status: 'active',
    bookings: 18,
    rating: 4.6
  },
  {
    id: 3,
    title: "Villa con Piscina Privada",
    location: "Bogotá, Colombia",
    price: 220,
    status: 'pending',
    bookings: 12,
    rating: 4.9
  }
];

export default function PropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [properties] = useState<Property[]>(mockProperties);

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'inactive':
        return 'Inactiva';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
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
    console.log('Delete property:', propertyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600">Gestiona tus alojamientos y sus detalles</p>
        </div>
        <Button
          leftIcon={Plus}
          onClick={() => router.push('/host/properties/publish')}
        >
          Nueva Propiedad
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-light-500 focus:border-blue-light-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-light-100 to-blue-light-200 flex items-center justify-center">
              <div className="text-blue-light-600 text-lg font-medium">
                Imagen de la Propiedad
              </div>
            </div>

            {/* Property Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {property.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {getStatusText(property.status)}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{property.location}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${property.price}
                  <span className="text-sm font-normal text-gray-600">/noche</span>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>★ {property.rating}</div>
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron propiedades' : 'No tienes propiedades aún'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza publicando tu primera propiedad para empezar a recibir huéspedes'
            }
          </p>
          {!searchTerm && (
            <Button
              leftIcon={Plus}
              onClick={() => router.push('/host/properties/publish')}
            >
              Publicar Primera Propiedad
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
