export default function CommissionPolicyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Política de Comisiones de Smart</h1>
      <p className="text-sm text-gray-500">Última actualización: 24 Nov 2024</p>

      <section className="space-y-4">
        <p>
          En Smart, creemos en la transparencia total. Nuestra plataforma opera con un modelo de comisión
          que nos permite mantener el servicio seguro, ofrecer soporte 24/7 y mejorar continuamente la experiencia.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8">1. Comisión para Huéspedes</h2>
        <p>
          Aplicamos una tarifa de servicio al huésped que varía entre el <strong>5% y el 15%</strong> del subtotal de la reserva. 
          Esta tarifa se muestra desglosada antes de confirmar el pago.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>El porcentaje exacto depende de la duración de la estancia y las características del inmueble.</li>
          <li>Esta tarifa cubre los costos de procesamiento de pagos y la protección al viajero.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8">2. Comisión para Anfitriones</h2>
        <p>
          Cobramos una tarifa plana del <strong>3%</strong> a los anfitriones por cada reserva completada.
        </p>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4">
          <p className="text-blue-800 text-sm font-medium">
            Ejemplo: Si alquilas tu espacio por S/ 1000, recibirás S/ 970. Smart retiene S/ 30 para cubrir costos transaccionales.
          </p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mt-8">3. IVA e Impuestos Locales</h2>
        <p>
          Dependiendo de la ubicación de la propiedad, Smart puede estar obligado a recaudar y remitir impuestos locales 
          o IVA sobre nuestras tarifas de servicio.
        </p>
      </section>
    </div>
  );
}