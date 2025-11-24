import { BookOpen, Camera, Shield } from "lucide-react";

export default function HostResourcesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Centro de Recursos para Anfitriones
        </h1>
        <p className="mt-2 text-gray-600">
          Guías, consejos y mejores prácticas para tener éxito en Smart.
        </p>
      </header>

      <div className="grid gap-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Fotografía que vende</h3>
            <p className="text-sm text-gray-600">
              Aprende a iluminar y encuadrar tus fotos para destacar tu espacio
              y conseguir más reservas.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-green-100 p-3 text-green-700">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Seguridad en el hogar</h3>
            <p className="text-sm text-gray-600">
              Lista de verificación esencial: detectores de humo, botiquín de
              primeros auxilios y números de emergencia.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Manual de la casa</h3>
            <p className="text-sm text-gray-600">
              Cómo crear una guía de bienvenida clara para que tus huéspedes se
              sientan como en casa desde el primer minuto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
