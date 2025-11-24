import { ShieldCheck, UserX, MessageSquareWarning } from "lucide-react";

export default function TrustSafetyPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confianza y Seguridad</h1>
        <p className="text-xl text-gray-600">Cómo mantenemos segura a la comunidad Smart.</p>
      </header>

      <div className="grid gap-8">
        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verificación de Identidad</h2>
            <p className="text-gray-600">
              Para proteger a anfitriones y huéspedes, exigimos verificación de correo electrónico. 
              En reservas de alto valor, podemos solicitar un documento de identidad oficial.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <UserX className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tolerancia Cero al Fraude</h2>
            <p className="text-gray-600">
              Nuestros administradores monitorean activamente las publicaciones. Cualquier intento de estafa, 
              o publicación de alojamientos inexistentes, resultará en el <strong>baneo permanente</strong> de la plataforma.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reseñas Auténticas</h2>
            <p className="text-gray-600">
              Solo los usuarios que han completado una estancia pueden dejar una reseña. 
              Moderamos y eliminamos reseñas que violen nuestras normas de contenido (discurso de odio, spam o irrelevancia), 
              pero nunca eliminamos una reseña solo por ser negativa.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}