export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Política de Privacidad
      </h1>

      <section className="space-y-4">
        <p>
          Tu privacidad es fundamental para mantener la confianza en la
          comunidad Smart. Esta política detalla qué datos recopilamos y cómo
          los protegemos.
        </p>

        <h2 className="mt-8 text-xl font-bold text-gray-900">
          1. Protección de Datos de Contacto
        </h2>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">
            Regla de Oro: Smart nunca revelará tu número de teléfono o correo
            electrónico personal a otros usuarios antes de que una reserva sea
            confirmada oficialmente.
          </p>
        </div>
        <p>
          Toda comunicación previa a la reserva debe realizarse exclusivamente a
          través del chat interno de Smart para tu seguridad.
        </p>

        <h2 className="mt-8 text-xl font-bold text-gray-900">
          2. Información que compartimos
        </h2>
        <p>Una vez confirmada una reserva, compartiremos con la contraparte:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nombre completo y foto de perfil.</li>
          <li>Número de teléfono para coordinación de llegada.</li>
          <li>Dirección exacta de la propiedad (solo al huésped).</li>
        </ul>

        <h2 className="mt-8 text-xl font-bold text-gray-900">
          3. Uso de la Información
        </h2>
        <p>Usamos tus datos para:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Verificar tu identidad y prevenir fraudes.</li>
          <li>Procesar pagos y gestionar reembolsos.</li>
          <li>
            Enviar notificaciones sobre el estado de tu viaje o alojamiento.
          </li>
        </ul>
      </section>
    </div>
  );
}
