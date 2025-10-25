import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Anfitrión - Smart",
  description: "Panel de control para anfitriones",
};

export default function HostDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a tu Panel de Anfitrión!
        </h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            🎉 ¡Felicidades!
          </h2>
          <p className="text-green-700">
            Te has convertido exitosamente en anfitrión. Ahora puedes comenzar a 
            publicar tus propiedades y generar ingresos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Mis Propiedades</h3>
            <p className="text-blue-600 text-sm">
              Gestiona y publica tus espacios
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Reservas</h3>
            <p className="text-purple-600 text-sm">
              Revisa tus reservas activas
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Ganancias</h3>
            <p className="text-orange-600 text-sm">
              Monitorea tus ingresos
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Próximos Pasos:</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>Completa tu perfil de anfitrión</li>
            <li>Agrega tu primera propiedad</li>
            <li>Configura tus precios y disponibilidad</li>
            <li>Publica tu listado para comenzar a recibir reservas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}