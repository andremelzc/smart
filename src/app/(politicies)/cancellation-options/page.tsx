export default function CancellationOptionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Políticas de Cancelación
      </h1>
      <p>
        Los anfitriones eligen la política que mejor se adapta a su espacio.
        Revisa la política específica de cada alojamiento antes de reservar.
      </p>

      <div className="mt-8 grid gap-6">
        {/* Flexible */}
        <div className="rounded-2xl border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-green-700">Flexible</h3>
          <p className="mb-4">
            Reembolso completo hasta 24 horas antes de la llegada.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>
              Cancelación con menos de 24h: Se cobra la primera noche y la
              tarifa de servicio.
            </li>
            <li>
              Si el huésped llega y decide irse antes, se reembolsan las noches
              no disfrutadas 24h después de la cancelación.
            </li>
          </ul>
        </div>

        {/* Moderada */}
        <div className="rounded-2xl border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-yellow-700">Moderada</h3>
          <p className="mb-4">
            Reembolso completo hasta 5 días antes de la llegada.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>
              Cancelación entre 5 días y 24h antes: Se cobra el 50% de la
              reserva.
            </li>
            <li>Cancelación con menos de 24h: No hay reembolso.</li>
          </ul>
        </div>

        {/* Estricta */}
        <div className="rounded-2xl border p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-red-700">Estricta</h3>
          <p className="mb-4">
            Reembolso del 50% hasta 1 semana antes de la llegada.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Cancelación con menos de 7 días: No hay reembolso.</li>
            <li>
              La tarifa de limpieza siempre se reembolsa si no se hace el
              check-in.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
