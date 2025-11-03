// src/components/host/crear-recinto/Paso9_Resumen.tsx
import { Edit } from 'lucide-react';

// El 'any' es temporal mientras definimos la data completa
export function Paso9_Resumen({ data, goToStep }: { data: any, goToStep: (step: number) => void }) {

  const ResumenItem = ({ label, value, editStep }: any) => (
    <div className="flex justify-between items-center py-4 border-b">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg text-gray-900">{value}</p>
      </div>
      <button 
        onClick={() => goToStep(editStep)}
        className="flex items-center gap-2 text-blue-light-500 hover:underline"
      >
        <Edit className="w-4 h-4" />
        Editar
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Confirma tu recinto</h1>
      <p className="text-gray-600 mb-8">
        Revisa que toda la información sea correcta.
      </p>
      <div className="space-y-2">
        <ResumenItem label="Título" value={data.title || 'Sin Título'} editStep={6} />
        <ResumenItem label="Tipo de Recinto" value={data.propertyType || 'Sin Tipo'} editStep={1} />
        <ResumenItem label="Ubicación" value={data.addressText || 'Sin Ubicación'} editStep={2} />
      </div>
    </div>
  );
}