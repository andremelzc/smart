'use client';

import { useState, useEffect } from 'react';
import { UpdatePropertyBody } from '@/src/types/dtos/properties.dto';

interface UsePropertyEditReturn {
  propertyData: Partial<UpdatePropertyBody> | null;
  isLoading: boolean;
  error: string | null;
  updateProperty: (data: Partial<UpdatePropertyBody>) => Promise<boolean>;
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  resetUpdateState: () => void;
}

export const usePropertyEdit = (propertyId: number): UsePropertyEditReturn => {
  const [propertyData, setPropertyData] = useState<Partial<UpdatePropertyBody> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Mock function to fetch property data - replace with actual API call
  const fetchPropertyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call to get property data
      // For now, we'll use mock data or leave it empty to be filled by the form
      const mockData: Partial<UpdatePropertyBody> = {
        title: '',
        basePriceNight: 0,
        addressText: '',
        city: '',
        stateRegion: '',
        country: '',
        postalCode: '',
        latitude: 0,
        longitude: 0,
        descriptionLong: '',
        houseRules: '',
        checkinTime: '',
        checkoutTime: '',
        capacity: 1,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
      };

      setPropertyData(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la propiedad';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProperty = async (data: Partial<UpdatePropertyBody>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la propiedad');
      }

      setUpdateSuccess(true);
      
      // Update local property data with the new values
      setPropertyData(prev => ({
        ...prev,
        ...data
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar';
      setUpdateError(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const resetUpdateState = () => {
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    }
  }, [propertyId]);

  return {
    propertyData,
    isLoading,
    error,
    updateProperty,
    isUpdating,
    updateError,
    updateSuccess,
    resetUpdateState,
  };
};
