export default function AccessibilityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Accesibilidad en Smart</h1>
      <p className="text-xl text-gray-600">Creemos que viajar es para todos.</p>

      <section className="space-y-4 mt-6">
        <h2 className="text-xl font-bold text-gray-900">Filtros de búsqueda adaptados</h2>
        <p>
          Hemos implementado filtros específicos para encontrar alojamientos que se adapten a tus necesidades de movilidad:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Entrada sin escalones.</li>
          <li>Puertas de más de 80cm de ancho.</li>
          <li>Baños con barras de sujeción.</li>
          <li>Espacios de estacionamiento accesibles.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-xl font-bold text-gray-900">Compromiso Digital</h2>
        <p>
          Trabajamos continuamente para que nuestra plataforma web y móvil cumpla con las pautas WCAG 2.1 AA, 
          asegurando que sea navegable mediante lectores de pantalla y teclados.
        </p>
      </section>
    </div>
  );
}