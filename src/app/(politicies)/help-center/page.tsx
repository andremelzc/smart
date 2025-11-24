import { Search, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function HelpCenterPage() {
  return (
    <div className="space-y-8">
      <header className="text-center space-y-4 pb-8 border-b">
        <h1 className="text-3xl font-bold text-gray-900">¿Cómo podemos ayudarte?</h1>
        <div className="relative max-w-lg mx-auto">
          <input 
            type="text" 
            placeholder="Buscar temas (ej: reembolso, check-in...)" 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-2xl hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-2">Soy Huésped</h3>
          <ul className="space-y-2 text-blue-600">
            <li><a href="#" className="hover:underline">Cómo reservar un alojamiento</a></li>
            <li><a href="#" className="hover:underline">Opciones de pago</a></li>
            <li><a href="#" className="hover:underline">Cancelar mi reserva</a></li>
          </ul>
        </div>
        <div className="p-6 border rounded-2xl hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-2">Soy Anfitrión</h3>
          <ul className="space-y-2 text-blue-600">
            <li><a href="#" className="hover:underline">Cómo publicar mi espacio</a></li>
            <li><a href="#" className="hover:underline">Política de cobros y pagos</a></li>
            <li><a href="#" className="hover:underline">Consejos de seguridad</a></li>
          </ul>
        </div>
      </section>

      <section className="bg-gray-50 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">¿Necesitas más ayuda?</h2>
        <p className="text-gray-600">Nuestro equipo de soporte está disponible 24/7.</p>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" className="gap-2">
            <MessageCircle className="w-4 h-4" /> Chat en vivo
          </Button>
          <Button variant="ghost" className="gap-2">
            <Phone className="w-4 h-4" /> Llamarnos
          </Button>
        </div>
      </section>
    </div>
  );
}