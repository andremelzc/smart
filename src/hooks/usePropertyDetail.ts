'use client';

import { useState, useEffect } from 'react';
import { PropertyDetail } from '@/src/types/dtos/properties.dto';

interface UsePropertyDetailReturn {
  property: PropertyDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePropertyDetail = (propertyId: string | number): UsePropertyDetailReturn => {
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = async () => {
    if (!propertyId) {
      setError('ID de propiedad no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar la propiedad');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setProperty(data.data);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const refetch = () => {
    fetchProperty();
  };

  return {
    property,
    isLoading,
    error,
    refetch,
  };
};