// src/components/host/crear-recinto/Paso8_Reglas.tsx
import { StepHeader } from './StepHeader';
import { Clock, ListChecks, CheckCircle, XCircle } from 'lucide-react';

interface StepProps {
  data: {
    houseRules: string;
    checkinTime: string; 
    checkoutTime: string; 
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}


const MIN_RULES_LENGTH = 20; 

export function Paso8_Reglas({ data, updateData }: StepProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="📏 Establece las reglas de tu recinto"
        subtitle="Defina los horarios clave y las normas de convivencia."
        helpText="Recuerde que ser claro con las reglas desde el principio ayuda a evitar malentendidos. Los huéspedes deben aceptar estas reglas antes de reservar."
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-blue-light-700">
          Horarios de Check-in y Check-out
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
            <span className="text-lg font-medium text-gray-dark-700">
              Hora de Check-in (Llegada)
            </span>
            <div className="relative">
              <Clock className="w-5 h-5 text-blue-light-700 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="time"
                name="checkinTime"
                value={data.checkinTime}
                onChange={handleChange}
                step="1800" 
                className="relative w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                           py-3 pl-12 pr-4 text-gray-dark-700 outline-none
                           focus:border-blue-light-700 focus:ring-2 focus:ring-blue-light-100"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
            <span className="text-lg font-medium text-gray-dark-700">
              Hora de Check-out (Salida)
            </span>
            <div className="relative">
              <Clock className="w-5 h-5 text-blue-light-700 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <input
                type="time"
                name="checkoutTime"
                value={data.checkoutTime}
                onChange={handleChange}
                step="1800" 
                className="relative w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                           py-3 pl-12 pr-4 text-gray-dark-700 outline-none
                           focus:border-blue-light-700 focus:ring-2 focus:ring-blue-light-100"
              />
            </div>
          </label>
        </div>
      </div>

      <hr className="my-4 border-t border-blue-light-300" />

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-blue-light-700">
          Reglas Adicionales
        </h2>
        <p className="text-md text-gray-dark-500">
          Añade cualquier otra norma específica de tu espacio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          <div className="flex flex-col gap-2">
            <textarea
              id="houseRules"
              name="houseRules"
              value={data.houseRules}
              onChange={handleChange}
              rows={8}
              placeholder="Ej: No hacer ruido después de las 10 PM. No dejar la basura fuera..."
              className="w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                         py-3 px-4 text-gray-dark-700 outline-none
                         focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
            />
            <span className={`text-sm font-medium
                             ${data.houseRules.length < MIN_RULES_LENGTH ? 'text-red-500' : 'text-green-600'}`}
            >
              {data.houseRules.length} / {MIN_RULES_LENGTH} caracteres mínimos recomendados
            </span>
          </div>

          <div className="rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 p-6 h-fit">
            <div className="flex items-center gap-3">
              <ListChecks className="w-8 h-8 text-blue-light-700" />
              <h3 className="text-xl font-semibold text-blue-light-700">
                ¿Qué reglas incluir?
              </h3>
            </div>
            <p className="text-gray-dark-600 mt-3 mb-4">
              Piensa en cosas que sean importantes para ti y tu espacio:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  Invitados: ¿Se permiten visitas que no estén en la reserva?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-dark-700">
                    Ruido: ¿Hay horarios de silencio? (Ej: &quot;No música alta después de las 10 PM&quot;).
                  </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  Seguridad: (Ej: &quot;Cerrar siempre la puerta principal con llave&quot;).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  No incluyas reglas que ya cubrimos (Mascotas, Fumar, Fiestas)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}