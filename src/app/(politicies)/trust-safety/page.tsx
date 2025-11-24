import { ShieldCheck, UserX, MessageSquareWarning } from "lucide-react";

export default function TrustSafetyPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Confianza y Seguridad
        </h1>
        <p className="text-xl text-gray-600">
          Cómo mantenemos segura a la comunidad Smart.
        </p>
      </header>

      <div className="grid gap-8">
        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Verificación de Identidad
            </h2>
            <p className="text-gray-600">
              Para proteger a anfitriones y huéspedes, exigimos verificación de
              correo electrónico. En reservas de alto valor, podemos solicitar
              un documento de identidad oficial.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <UserX className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Tolerancia Cero al Fraude
            </h2>
            <p className="text-gray-600">
              Nuestros administradores monitorean activamente las publicaciones.
              Cualquier intento de estafa, o publicación de alojamientos
              inexistentes, resultará en el <strong>baneo permanente</strong> de
              la plataforma.
            </p>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Reseñas Auténticas
            </h2>
            <p className="text-gray-600">
              Solo los usuarios que han completado una estancia pueden dejar una
              reseña. Moderamos y eliminamos reseñas que violen nuestras normas
              de contenido (discurso de odio, spam o irrelevancia), pero nunca
              eliminamos una reseña solo por ser negativa.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
