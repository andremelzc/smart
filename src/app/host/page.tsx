export default function HostPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenido a Smart Host
        </h1>
        
        <p className="text-gray-600 mb-6">
          Esta es la página principal de la sección de anfitriones. 
          Desde aquí puedes acceder a todas las funcionalidades para gestionar tus propiedades.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Dashboard</h3>
            <p className="text-blue-600 text-sm">
              Ve un resumen de tu actividad como anfitrión
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Propiedades</h3>
            <p className="text-green-600 text-sm">
              Gestiona tus listados y propiedades
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Reservas</h3>
            <p className="text-purple-600 text-sm">
              Administra las reservas de tus huéspedes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}