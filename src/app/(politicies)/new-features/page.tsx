import { Sparkles, Zap, Smartphone } from "lucide-react";

export default function NewFeaturesPage() {
  return (
    <div className="space-y-8">
      <header className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-10 rounded-3xl mb-8">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
        <h1 className="text-3xl font-bold">Lanzamiento de Invierno 2024</h1>
        <p className="mt-2 text-blue-100">Descubre las últimas mejoras que hemos creado para ti.</p>
      </header>

      <div className="grid gap-8">
        <section className="flex gap-6 items-start">
          <div className="bg-gray-100 p-4 rounded-xl">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reserva Inmediata 2.0</h2>
            <p className="text-gray-600 mt-2">
              Ahora los anfitriones pueden establecer requisitos más estrictos para las reservas inmediatas, 
              dando más control sin perder velocidad.
            </p>
          </div>
        </section>

        <section className="flex gap-6 items-start">
          <div className="bg-gray-100 p-4 rounded-xl">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Nueva Experiencia Móvil</h2>
            <p className="text-gray-600 mt-2">
              Hemos rediseñado la bandeja de entrada para que comunicarte con tu anfitrión sea más rápido y fluido desde tu celular.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}