// src/components/host/crear-recinto/Paso9_Resumen.tsx
import { StepHeader } from './StepHeader';
import { Edit, Camera, Home, MapPin, Users, Sparkles, DollarSign, ListChecks } from 'lucide-react';

interface StepProps {
  data: any; 
  goToStep: (step: number) => void;
}

function ResumenSection({ title, editStep, icon, children, goToStep }: any) {
  return (
    <div className="rounded-2xl border-2 border-blue-light-300 bg-white">
      <div className="flex justify-between items-center p-4 border-b border-blue-light-300">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-xl font-semibold text-blue-light-700">{title}</h3>
        </div>
        <button
          onClick={() => goToStep(editStep)}
          className="flex items-center gap-2 text-sm font-bold text-blue-vivid-600 hover:text-blue-vivid-800"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function Paso9_Resumen({ data, goToStep }: StepProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: data.currencyCode || 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="¡Casi listo! Revisa tu anuncio"
        subtitle="Confirma que toda la información sea correcta. Este es el anuncio que verán los huéspedes."
        helpText="Puedes hacer clic en 'Editar' en cualquier sección para volver y hacer cambios. Cuando estés listo, ¡publica tu recinto!"
      />
    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="flex flex-col gap-6">
          
          <ResumenSection title="Título y Tipo" editStep={1} goToStep={goToStep} icon={<Home className="w-6 h-6 text-blue-light-700" />}>
            <h4 className="text-lg font-bold text-gray-dark-900">{data.title || "Sin Título"}</h4>
            <p className="text-md text-gray-dark-600 capitalize">{data.propertyType || "Sin tipo"}</p>
          </ResumenSection>

          <ResumenSection title="Detalles del Espacio" editStep={3} goToStep={goToStep} icon={<Users className="w-6 h-6 text-blue-light-700" />}>
            <ul className="list-disc list-inside text-md text-gray-dark-700 space-y-1">
              <li>{data.capacity} huéspedes</li>
              <li>{data.bedrooms} {data.bedrooms === 1 ? 'habitación' : 'habitaciones'}</li>
              <li>{data.beds} {data.beds === 1 ? 'cama' : 'camas'}</li>
              <li>{data.bathrooms} {data.bathrooms === 1 ? 'baño' : 'baños'}</li>
              {data.areaM2 > 0 && <li>{data.areaM2} m²</li>}
            </ul>
          </ResumenSection>

          <ResumenSection title="Servicios" editStep={4} goToStep={goToStep} icon={<Sparkles className="w-6 h-6 text-blue-light-700" />}>
            <p className="text-md text-gray-dark-700">
              {data.amenities.length} {data.amenities.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}.
            </p>
          </ResumenSection>

          <ResumenSection title="Reglas y Horarios" editStep={8} goToStep={goToStep} icon={<ListChecks className="w-6 h-6 text-blue-light-700" />}>
            <p className="text-md text-gray-dark-700">Check-in: <strong>{data.checkinTime}</strong></p>
            <p className="text-md text-gray-dark-700">Check-out: <strong>{data.checkoutTime}</strong></p>
            <p className="text-md text-gray-dark-700 mt-2 whitespace-pre-line">{data.houseRules}</p>
          </ResumenSection>

        </div>
        
        <div className="flex flex-col gap-6">

          <ResumenSection title="Fotos" editStep={5} goToStep={goToStep} icon={<Camera className="w-6 h-6 text-blue-light-700" />}>
            <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden border border-blue-light-150">
              {data.images.slice(0, 3).map((img: any) => ( // Mostramos las primeras 3
                <div key={img.sortOrder} className="aspect-square">
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                </div>
              ))}
              {data.images.length > 3 && (
                <div className="aspect-square bg-blue-light-50 flex items-center justify-center text-blue-light-700 font-semibold">
                  +{data.images.length - 3} más
                </div>
              )}
            </div>
          </ResumenSection>
          
          <ResumenSection title="Ubicación" editStep={2} goToStep={goToStep} icon={<MapPin className="w-6 h-6 text-blue-light-700" />}>
            <p className="text-md text-gray-dark-700">{data.addressText}</p>
            <p className="text-md text-gray-dark-700">{data.city}, {data.stateRegion}</p>
            <p className="text-md text-gray-dark-700">{data.country}, {data.postalCode}</p>
          </ResumenSection>

          <ResumenSection title="Precio" editStep={7} goToStep={goToStep} icon={<DollarSign className="w-6 h-6 text-blue-light-700" />}>
            <span className="text-3xl font-bold text-gray-dark-900">
              {formatCurrency(data.basePriceNight)}
            </span>
            <span className="text-lg text-gray-dark-600"> / noche</span>
          </ResumenSection>

        </div>
        
      </div>
    </div>
  );
}