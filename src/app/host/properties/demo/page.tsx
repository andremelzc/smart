'use client';

import React, { useState } from 'react';
import PropertyEditForm from '@/src/components/features/properties/PropertyEditForm';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, TestTube } from 'lucide-react';
import { UpdatePropertyBody } from '@/src/types/dtos/properties.dto';

export default function PropertyEditDemoPage() {
  const [showForm, setShowForm] = useState(false);
  const [demoPropertyId, setDemoPropertyId] = useState(1);

  // Sample data for testing
  const sampleData: Partial<UpdatePropertyBody> = {
    title: 'Casa Moderna con Vista al Mar',
    basePriceNight: 150,
    addressText: 'Calle 123 #45-67',
    city: 'Cartagena',
    stateRegion: 'Bolívar',
    country: 'Colombia',
    postalCode: '130001',
    latitude: 10.3932,
    longitude: -75.4832,
    descriptionLong: 'Hermosa casa moderna ubicada frente al mar en Cartagena. Perfecta para vacaciones familiares o escapadas románticas. Cuenta con todas las comodidades modernas y acceso directo a la playa.',
    houseRules: 'No fumar dentro de la casa, No mascotas, Hora de silencio después de las 10 PM, Respete a los vecinos',
    checkinTime: '15:00',
    checkoutTime: '11:00',
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
  };

  const handleSuccess = () => {
    alert('¡Propiedad actualizada exitosamente! (Demo)');
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleStartDemo = () => {
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={handleCancel}
            >
              Volver al Demo
            </Button>
          </div>
          
          <PropertyEditForm
            propertyId={demoPropertyId}
            initialData={sampleData}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-light-100 rounded-full mb-6">
            <TestTube className="w-8 h-8 text-blue-light-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo: Editar Propiedad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prueba el formulario de edición de propiedades con datos de ejemplo. 
            Esta es una demostración funcional del endpoint PATCH /api/properties/:id
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Características del Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Funcionalidades</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Formulario completo de edición de propiedades</li>
                <li>• Validación en tiempo real de campos</li>
                <li>• Mensajes de éxito y error</li>
                <li>• Indicador de cambios sin guardar</li>
                <li>• Loading states durante el guardado</li>
                <li>• Integración con el endpoint PATCH</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 UX/UI Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Diseño responsivo y moderno</li>
                <li>• Paleta de colores consistente</li>
                <li>• Iconos y animaciones sutiles</li>
                <li>• Agrupación lógica de campos</li>
                <li>• Feedback visual inmediato</li>
                <li>• Accesibilidad mejorada</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Datos de Prueba</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Propiedad de Ejemplo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Título:</strong> {sampleData.title}
              </div>
              <div>
                <strong>Precio:</strong> ${sampleData.basePriceNight}/noche
              </div>
              <div>
                <strong>Ubicación:</strong> {sampleData.city}, {sampleData.stateRegion}
              </div>
              <div>
                <strong>Capacidad:</strong> {sampleData.capacity} huéspedes
              </div>
              <div>
                <strong>Habitaciones:</strong> {sampleData.bedrooms}
              </div>
              <div>
                <strong>Baños:</strong> {sampleData.bathrooms}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Propiedad para Demo
              </label>
              <input
                type="number"
                value={demoPropertyId}
                onChange={(e) => setDemoPropertyId(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-light-500 focus:border-blue-light-500"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleStartDemo}
                size="lg"
                className="w-full sm:w-auto"
              >
                Iniciar Demo
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-light-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Nota Técnica</h3>
          <p className="text-gray-700">
            Este demo utiliza el endpoint <code className="bg-white px-2 py-1 rounded text-sm">PATCH /api/properties/:id</code> 
            que se conecta a Oracle usando el stored procedure <code className="bg-white px-2 py-1 rounded text-sm">SP_UPDATE_PROPERTY</code>. 
            En el entorno de desarrollo, las actualizaciones son simuladas para propósitos de demostración.
          </p>
        </div>
      </div>
    </div>
  );
}
