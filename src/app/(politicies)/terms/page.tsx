import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-gray-500">Última actualización: 24 Nov 2024</p>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mt-8">1. Registro y Cuentas</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Verificación Obligatoria:</strong> Todo usuario debe registrarse con un correo válido. 
            Smart se reserva el derecho de solicitar verificación de identidad antes de permitir reservas o publicaciones.
          </li>
          <li>
            <strong>Roles de Usuario:</strong> Un usuario puede actuar como Huésped o Anfitrión. 
            El uso indebido de la cuenta para fines fraudulentos resultará en la suspensión inmediata.
          </li>
          <li>
            <strong>Suspensión:</strong> Los administradores de Smart tienen la facultad exclusiva de suspender cuentas 
            que violen estas normas o publiquen contenido fraudulento.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8">2. Reglas para Anfitriones</h2>
        <p>Al publicar un espacio en Smart, aceptas que:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>La información (fotos, dirección, precio) debe ser veraz y corresponder al inmueble real.</li>
          <li>No puedes eliminar definitivamente una habitación si tiene reservas activas pendientes.</li>
          <li>Debes respetar las reservas confirmadas salvo causa de fuerza mayor.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8">3. Pagos y Retenciones</h2>
        <p>
          Smart actúa como intermediario de confianza en la transacción:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Cobro al Huésped:</strong> El pago se cobra por completo en el momento de confirmar la reserva.
          </li>
          <li>
            <strong>Retención (Escrow):</strong> Smart retiene los fondos por seguridad.
          </li>
          <li>
            <strong>Liberación:</strong> El pago se libera al anfitrión <strong>24 horas después</strong> del check-in programado, 
            siempre que no existan reportes de problemas por parte del huésped.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8">4. Prohibiciones</h2>
        <p>
          Está estrictamente prohibido intentar eludir la plataforma para realizar pagos fuera de Smart. 
          Detectar esta actividad conllevará la expulsión permanente de ambos usuarios.
        </p>
      </section>
    </div>
  );
}