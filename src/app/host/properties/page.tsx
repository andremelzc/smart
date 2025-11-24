'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/Button';
import { Plus, Edit3, Eye, Trash2, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { getHostProperties } from '@/src/hooks/useGetProperties';


interface ServerPropertyData {
  propertyId: number;
  title: string;
  city: string;
  country: string;
  basePriceNight: number;
  isActive: boolean | number; 
  reviews?: {
    totalCount: number;
    averageRating: number;
  };
  images?: {
    id: number;
    url: string;
    isPrimary: boolean;
  }[];
}

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  status: 'active' | 'inactive' | 'pending';
  bookings: number;
  rating: number;
  imageUrl?: string;
}


const PropertyImage = ({ src, alt }: { src?: string, alt: string }) => {
  const [hasError, setHasError] = React.useState(false);

  if (src && !hasError) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
      <div className="text-blue-600 text-lg font-medium flex flex-col items-center gap-2">
        <span className="text-4xl">🏠</span>
        <span>Sin Imagen</span>
      </div>
    </div>
  );
};

export default function PropertiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (authLoading) return;

      if (!isAuthenticated || !user?.id) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        const hostId = Number(user.id);
        
        const dbProperties = await getHostProperties(hostId) as ServerPropertyData[];

        const mappedProperties: Property[] = dbProperties.map((p) => ({
          id: p.propertyId,
          title: p.title,
          location: `${p.city}, ${p.country}`,
          price: p.basePriceNight,
          status: p.isActive ? 'active' : 'inactive', 
          bookings: p.reviews?.totalCount || 0,
          rating: p.reviews?.averageRating || 0,
          imageUrl: p.images?.find((img) => img.isPrimary)?.url
        }));

        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error cargando propiedades:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProperties();
  }, [user, isAuthenticated, authLoading]);

  // Filtrado en el cliente
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
    console.log('Delete property:', propertyId);
  };

  // Render de carga inicial
  if (authLoading || (isAuthenticated && isLoadingData)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

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
          onClick={() => router.push('/host/properties/create')}
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Property Image Section */}
            <div className="h-48 relative overflow-hidden">
              <PropertyImage 
                src={property.imageUrl} 
                alt={property.title} 
              />
              {/* Badge de estado superpuesto */}
              <div className="absolute top-3 right-3">
                 <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(property.status)}`}>
                   {getStatusText(property.status)}
                 </span>
              </div>
            </div>

            {/* Property Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {property.title}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-4">{property.location}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${property.price}
                  <span className="text-sm font-normal text-gray-600">/noche</span>
                </div>

                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center gap-1 justify-end">
                    <span>★</span> {property.rating}
                  </div>
                  <div>{property.bookings} reviews</div>
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
      {!isLoadingData && filteredProperties.length === 0 && (
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