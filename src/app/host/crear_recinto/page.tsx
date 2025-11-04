// app/host/crear_recinto/page.tsx
'use client';

import { useState } from 'react';

import { Paso1_TipoRecinto } from '@/src/components/host/crear-recinto/Paso1_TipoRecinto';
import { Paso2_Ubicacion } from '@/src/components/host/crear-recinto/Paso2_Ubicacion';
// import { Paso3_Detalles } from '@/src/components/host/crear-recinto/Paso3_Detalles';
// import { Paso4_Servicios } from '@/src/components/host/crear-recinto/Paso4_Servicios';
// import { Paso5_Fotos } from '@/src/components/host/crear-recinto/Paso5_Fotos';
// import { Paso6_TituloDescripcion } from '@/src/components/host/crear-recinto/Paso6_TituloDescripcion';
// import { Paso7_Reglas } from '@/src/components/host/crear-recinto/Paso7_Reglas';
// import { Paso8_Precio } from '@/src/components/host/crear-recinto/Paso8_Precio';
import { Paso9_Resumen } from '@/src/components/host/crear-recinto/Paso9_Resumen';

// Barra de progreso
import { ProgressBar } from '@/src/components/host/crear-recinto/ProgressBar';
// íconos
import { CircleChevronLeft } from 'lucide-react';
import { CircleChevronRight } from 'lucide-react';
// Nombres de la barra de progreso
const stepLabels = [
  "Tipo",
  "Ubicación",
  "Detalles",
  "Servicios",
  "Fotos",
  "Título",
  "Precio",
  "Reglas",
  "Resumen"
];

interface PropertyImageData {
  url: string;
  caption: string;
  sortOrder: number;
}

interface PropertyData {
  title: string;
  propertyType: string;
  basePriceNight: number; 
  currencyCode: string; 
  addressText: string; 
  formattedAddress: string;
  city: string;
  stateRegion: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  descriptionLong: string;
  houseRules: string;
  checkinTime: string;
  checkoutTime: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  areaM2: number;
  images: PropertyImageData[];
  amenities: string[];
}

export default function PaginaCrearRecinto() {
  
  const [currentStep, setCurrentStep] = useState(1);

  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: '',
    propertyType: '', 
    basePriceNight: 50,
    currencyCode: 'PEN',
    addressText: 'Av. Larco 123',
    formattedAddress: 'Av. Larco 123, Miraflores, Lima 15074, Perú',
    city: 'Miraflores',
    stateRegion: 'Lima',
    country: 'Perú',
    postalCode: '15074',
    latitude: -12.1218,
    longitude: -77.0309,
    
    descriptionLong: '',
    houseRules: 'No fumar en interiores.\nNo se permiten mascotas.',
    checkinTime: '15:00',
    checkoutTime: '11:00',
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    areaM2: 40,
    images: [],
    amenities: ['wifi', 'ac'],
  });

  const goToStep = (step: number) => {
    if (currentStep === 9 && step < 9) {
      setCurrentStep(step);
    }
    else if (step === currentStep + 1 || step === currentStep - 1) {
       setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 9) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<PropertyData>) => {
    setPropertyData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handlePublish = () => {
    console.log("--- SIMULANDO PUBLICACIÓN ---");
    console.log("DATOS A ENVIAR AL BACKEND:", propertyData);
    alert("¡Recinto publicado con éxito! (Simulación)");
  };

  return (
    <div className="min-h-screen bg-blue-light-50">
      <ProgressBar 
        steps={stepLabels} 
        currentStep={currentStep} 
        onStepClick={goToStep}
        isClickable={currentStep === 9}
      />

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        
        <div className="bg-white p-8 rounded-2xl shadow-lg min-h-[450px]">
          
          {currentStep === 1 && (
            <Paso1_TipoRecinto 
              data={{ propertyType: propertyData.propertyType }} 
              updateData={updateData} 
            />
          )}

          {currentStep === 2 && (
            // <Paso2_Ubicacion data={...} updateData={updateData} />
            <Paso2_Ubicacion 
              // Le pasamos solo los datos que necesita
              data={{
                addressText: propertyData.addressText,
                city: propertyData.city,
                stateRegion: propertyData.stateRegion,
                country: propertyData.country,
                postalCode: propertyData.postalCode
              }} 
              updateData={updateData} 
            />
          )}

          {currentStep === 3 && (
            // <Paso3_Detalles data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 3: Detalles</h1>
              <p className="mt-2 text-lg text-gray-dark-500">
                (Capacidad, cuartos, baños, camas, m2)
              </p>
            </div>
          )}

          {currentStep === 4 && (
            // <Paso4_Servicios data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 4: Servicios</h1>
              <p className="mt-2 text-lg text-gray-dark-500">Componente en construcción...</p>
            </div>
          )}

          {currentStep === 5 && (
            // <Paso5_Fotos data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 5: Fotos</h1>
              <p className="mt-2 text-lg text-gray-dark-500">Componente en construcción...</p>
            </div>
          )}

          {currentStep === 6 && (
            // <Paso6_TituloDescripcion data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 6: Título y Descripción</h1>
              <p className="mt-2 text-lg text-gray-dark-500">Componente en construcción...</p>
            </div>
          )}

          {currentStep === 7 && (
            // <Paso7_Precio data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 7: Precio</h1>
              <p className="mt-2 text-lg text-gray-dark-500">Componente en construcción...</p>
            </div>
          )}
          
          {currentStep === 8 && (
            // <Paso8_Reglas data={...} updateData={updateData} />
            <div>
              <h1 className="text-3xl font-bold text-gray-dark-800">Paso 8: Reglas de la casa</h1>
              <p className="mt-2 text-lg text-gray-dark-500">Componente en construcción...</p>
            </div>
          )}

          {currentStep === 9 && (
            <Paso9_Resumen 
              data={propertyData} 
              goToStep={goToStep} 
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          
            <button 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 rounded-2xl bg-blue-vivid-600 border-2 border-blue-light-600 px-6 py-3 text-sm font-semibold text-blue-light-0 shadow-md transition-all hover:border-blue-light-800  hover:bg-blue-vivid-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
            <CircleChevronLeft className="w-6 h-6" />
            Atrás
            </button>

          {currentStep < 9 ? (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 rounded-2xl bg-blue-vivid-600 border-2 border-blue-light-600 px-6 py-3 text-sm font-semibold text-blue-light-0 shadow-md transition-all hover:border-blue-light-800  hover:bg-blue-vivid-700"
            >
            <CircleChevronRight className="w-6 h-6" />
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md border-2 border-green-700 transition-all hover:bg-green-700 hover:border-green-800"
            >
              Confirmar y Publicar
            </button>
          )}

        </div>
      </div>
    </div>
  );
}