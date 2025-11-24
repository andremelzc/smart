export default function PressPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Sala de Prensa</h1>
      
      <div className="space-y-6">
        <article className="border-b pb-6">
          <span className="text-sm text-blue-600 font-bold">NOTICIA • 20 NOV 2024</span>
          <h2 className="text-xl font-bold mt-1 mb-2">Smart alcanza el hito de 1 millón de reservas en Latinoamérica</h2>
          <p className="text-gray-600">
            Celebramos el crecimiento exponencial de nuestra comunidad de viajeros y anfitriones en la región.
          </p>
        </article>

        <article className="border-b pb-6">
          <span className="text-sm text-blue-600 font-bold">LANZAMIENTO • 15 OCT 2024</span>
          <h2 className="text-xl font-bold mt-1 mb-2">Presentamos "Smart Cover": Protección integral gratuita</h2>
          <p className="text-gray-600">
            Una nueva cobertura de seguridad para anfitriones que protege contra daños materiales inesperados.
          </p>
        </article>

        <article className="border-b pb-6">
          <span className="text-sm text-blue-600 font-bold">CORPORATIVO • 01 SET 2024</span>
          <h2 className="text-xl font-bold mt-1 mb-2">Compromiso con el turismo sostenible</h2>
          <p className="text-gray-600">
            Smart anuncia nuevas iniciativas para promover alojamientos ecológicos y reducir la huella de carbono.
          </p>
        </article>
      </div>
    </div>
  );
}