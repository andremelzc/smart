'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { UpdatePropertyBody } from '@/src/types/dtos/properties.dto';
import { Save, X, AlertCircle, CheckCircle, MapPin, Clock, Home, DollarSign } from 'lucide-react';

interface PropertyEditFormProps {
  propertyId: number;
  initialData?: Partial<UpdatePropertyBody>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormData = UpdatePropertyBody;

interface ValidationErrors {
  [key: string]: string;
}

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({
  propertyId,
  initialData = {},
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: initialData.title || '',
    basePriceNight: initialData.basePriceNight || 0,
    addressText: initialData.addressText || '',
    city: initialData.city || '',
    stateRegion: initialData.stateRegion || '',
    country: initialData.country || '',
    postalCode: initialData.postalCode || '',
    latitude: initialData.latitude || 0,
    longitude: initialData.longitude || 0,
    descriptionLong: initialData.descriptionLong || '',
    houseRules: initialData.houseRules || '',
    checkinTime: initialData.checkinTime || '',
    checkoutTime: initialData.checkoutTime || '',
    capacity: initialData.capacity || 1,
    bedrooms: initialData.bedrooms || 1,
    bathrooms: initialData.bathrooms || 1,
    beds: initialData.beds || 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes to show unsaved indicator
  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => {
      const currentValue = formData[key as keyof FormData];
      const initialValue = initialData[key as keyof UpdatePropertyBody];
      return currentValue !== initialValue;
    });
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialData]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Basic validations
    if (formData.title && formData.title.trim().length < 5) {
      errors.title = 'El titulo debe tener al menos 5 caracteres';
    }

    if (formData.basePriceNight && formData.basePriceNight < 0) {
      errors.basePriceNight = 'El precio no puede ser negativo';
    }

    if (formData.capacity && formData.capacity < 1) {
      errors.capacity = 'La capacidad debe ser al menos 1';
    }

    if (formData.bedrooms && formData.bedrooms < 1) {
      errors.bedrooms = 'Debe haber al menos 1 habitacion';
    }

    if (formData.bathrooms && formData.bathrooms < 1) {
      errors.bathrooms = 'Debe haber al menos 1 bano';
    }

    if (formData.beds && formData.beds < 1) {
      errors.beds = 'Debe haber al menos 1 cama';
    }

    // Validate coordinates if provided
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      errors.latitude = 'La latitud debe estar entre -90 y 90';
    }

    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      errors.longitude = 'La longitud debe estar entre -180 y 180';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Prepare data for submission (only include non-empty values)
      const submitData: Partial<UpdatePropertyBody> = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== 0 && value !== null && value !== undefined) {
          submitData[key as keyof UpdatePropertyBody] = value;
        }
      });

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la propiedad');
      }

      setSuccessMessage('Propiedad actualizada exitosamente!');
      setHasUnsavedChanges(false);

      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (
    id: keyof FormData,
    label: string,
    type: 'text' | 'number' | 'time' | 'textarea' = 'text',
    placeholder?: string,
    icon?: React.ReactNode,
    step?: string,
    min?: string | number,
    rows?: number
  ) => {
    const hasError = validationErrors[id];
    const value = formData[id];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          {type === 'textarea' ? (
            <textarea
              id={id}
              rows={rows || 3}
              value={value as string}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-light-500 transition-colors ${
                hasError 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-light-500'
              }`}
              placeholder={placeholder}
            />
          ) : (
            <input
              id={id}
              type={type}
              step={step}
              min={min}
              value={value as string | number}
              onChange={(e) => {
                const val = type === 'number' ?
                  (e.target.value === '' ? 0 : parseFloat(e.target.value)) :
                  e.target.value;
                handleInputChange(id, val);
              }}
              className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-light-500 transition-colors ${
                hasError 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-light-500'
              }`}
              placeholder={placeholder}
            />
          )}
        </div>
        {hasError && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Propiedad</h2>
          {hasUnsavedChanges && (
            <p className="text-sm text-amber-600 mt-1"> Tienes cambios sin guardar</p>
          )}
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={X}
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-blue-light-50 to-blue-light-100 p-6 rounded-lg border border-blue-light-200">
          <div className="flex items-center gap-2 mb-4">
            <Home className="text-blue-light-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Informacion Basica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInputField('title', 'Titulo de la Propiedad', 'text', 'Ej: Casa moderna con vista al mar')}
            {renderInputField('basePriceNight', 'Precio por Noche ($)', 'number', '100.00', <DollarSign size={16} />, '0.01', 0)}
          </div>

          <div className="mt-6">
            {renderInputField('descriptionLong', 'Descripcion Completa', 'textarea', 'Describe tu propiedad en detalle...', undefined, undefined, undefined, 4)}
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-gradient-to-r from-blue-light-50 to-blue-light-100 p-6 rounded-lg border border-blue-light-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-blue-light-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Ubicacion</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInputField('addressText', 'Direccion', 'text', 'Ej: Calle Principal 123')}
            {renderInputField('city', 'Ciudad', 'text', 'Ej: Medellin')}
            {renderInputField('stateRegion', 'Estado/Region', 'text', 'Ej: Antioquia')}
            {renderInputField('country', 'Pais', 'text', 'Ej: Colombia')}
            {renderInputField('postalCode', 'Codigo Postal', 'text', 'Ej: 050001')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {renderInputField('latitude', 'Latitud', 'number', 'Ej: 6.2442', undefined, 'any', -90)}
            {renderInputField('longitude', 'Longitud', 'number', 'Ej: -75.5812', undefined, 'any', -180)}
          </div>
        </div>

        {/* Property Details Section */}
        <div className="bg-gradient-to-r from-blue-light-50 to-blue-light-100 p-6 rounded-lg border border-blue-light-200">
          <div className="flex items-center gap-2 mb-4">
            <Home className="text-blue-light-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Detalles de la Propiedad</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {renderInputField('capacity', 'Capacidad', 'number', '4', undefined, undefined, 1)}
            {renderInputField('bedrooms', 'Habitaciones', 'number', '2', undefined, undefined, 1)}
            {renderInputField('bathrooms', 'Banos', 'number', '2', undefined, undefined, 1)}
            {renderInputField('beds', 'Camas', 'number', '2', undefined, undefined, 1)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {renderInputField('checkinTime', 'Hora de Check-in', 'time', undefined, <Clock size={16} />)}
            {renderInputField('checkoutTime', 'Hora de Check-out', 'time', undefined, <Clock size={16} />)}
          </div>

          <div className="mt-6">
            {renderInputField('houseRules', 'Reglas de la Casa', 'textarea', 'Ej: No fumar, No mascotas, Hora de silencio despues de las 10 PM...', undefined, undefined, undefined, 3)}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            leftIcon={Save}
            disabled={isLoading || Object.keys(validationErrors).length > 0}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyEditForm;
