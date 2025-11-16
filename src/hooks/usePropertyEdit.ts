'use client';

import { useState, useEffect, useCallback } from 'react';
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

    //Memorizar la función para que no cambie en cada render
    const fetchPropertyData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/properties/${propertyId}/edit`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cargar la propiedad');
            }

            const result = await response.json();

            if (result.success && result.data) {
                setPropertyData(result.data);
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar la propiedad';
            setError(errorMessage);
            console.error('Error fetching property data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [propertyId]); // 👈 Se vuelve a crear solo si cambia el ID

    const updateProperty = useCallback(async (data: Partial<UpdatePropertyBody>): Promise<boolean> => {
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

            // Actualiza los datos locales
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
    }, [propertyId]); // 👈 También depende del ID

    const resetUpdateState = useCallback(() => {
        setUpdateError(null);
        setUpdateSuccess(false);
    }, []);

    // ✅ Ahora sí: sin warnings
    useEffect(() => {
        if (propertyId) {
            fetchPropertyData();
        }
    }, [propertyId, fetchPropertyData]);

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
