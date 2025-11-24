import { Search, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function HelpCenterPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4 border-b pb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          ¿Cómo podemos ayudarte?
        </h1>
        <div className="relative mx-auto max-w-lg">
          <input
            type="text"
            placeholder="Buscar temas (ej: reembolso, check-in...)"
            className="w-full rounded-full border border-gray-300 py-3 pr-4 pl-12 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6 transition-shadow hover:shadow-md">
          <h3 className="mb-2 text-lg font-bold">Soy Huésped</h3>
          <ul className="space-y-2 text-blue-600">
            <li>
              <a href="#" className="hover:underline">
                Cómo reservar un alojamiento
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Opciones de pago
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cancelar mi reserva
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border p-6 transition-shadow hover:shadow-md">
          <h3 className="mb-2 text-lg font-bold">Soy Anfitrión</h3>
          <ul className="space-y-2 text-blue-600">
            <li>
              <a href="#" className="hover:underline">
                Cómo publicar mi espacio
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Política de cobros y pagos
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Consejos de seguridad
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-bold">¿Necesitas más ayuda?</h2>
        <p className="text-gray-600">
          Nuestro equipo de soporte está disponible 24/7.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" className="gap-2">
            <MessageCircle className="h-4 w-4" /> Chat en vivo
          </Button>
          <Button variant="ghost" className="gap-2">
            <Phone className="h-4 w-4" /> Llamarnos
          </Button>
        </div>
      </section>
    </div>
  );
}
