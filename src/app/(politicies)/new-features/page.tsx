import { Sparkles, Zap, Smartphone } from "lucide-react";

export default function NewFeaturesPage() {
  return (
    <div className="space-y-8">
      <header className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-center text-white">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-yellow-300" />
        <h1 className="text-3xl font-bold">Lanzamiento de Invierno 2024</h1>
        <p className="mt-2 text-blue-100">
          Descubre las últimas mejoras que hemos creado para ti.
        </p>
      </header>

      <div className="grid gap-8">
        <section className="flex items-start gap-6">
          <div className="rounded-xl bg-gray-100 p-4">
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Reserva Inmediata 2.0</h2>
            <p className="mt-2 text-gray-600">
              Ahora los anfitriones pueden establecer requisitos más estrictos
              para las reservas inmediatas, dando más control sin perder
              velocidad.
            </p>
          </div>
        </section>

        <section className="flex items-start gap-6">
          <div className="rounded-xl bg-gray-100 p-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Nueva Experiencia Móvil</h2>
            <p className="mt-2 text-gray-600">
              Hemos rediseñado la bandeja de entrada para que comunicarte con tu
              anfitrión sea más rápido y fluido desde tu celular.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
