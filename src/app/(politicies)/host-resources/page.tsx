import { BookOpen, Camera, Shield } from "lucide-react";

export default function HostResourcesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Centro de Recursos para Anfitriones</h1>
        <p className="text-gray-600 mt-2">Guías, consejos y mejores prácticas para tener éxito en Smart.</p>
      </header>

      <div className="grid gap-6">
        <div className="flex gap-4 items-start">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-700">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Fotografía que vende</h3>
            <p className="text-gray-600 text-sm">Aprende a iluminar y encuadrar tus fotos para destacar tu espacio y conseguir más reservas.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-green-100 p-3 rounded-lg text-green-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Seguridad en el hogar</h3>
            <p className="text-gray-600 text-sm">Lista de verificación esencial: detectores de humo, botiquín de primeros auxilios y números de emergencia.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Manual de la casa</h3>
            <p className="text-gray-600 text-sm">Cómo crear una guía de bienvenida clara para que tus huéspedes se sientan como en casa desde el primer minuto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}