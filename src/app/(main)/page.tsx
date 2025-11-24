import { HomeHighlightsService } from "@/src/services/home-highlights.service";
import type { CityHighlight } from "@/src/services/home-highlights.service";
import { CityCarousel } from "@/src/components/features/properties/CityCarousel";

export default async function HomePage() {
  let highlights: CityHighlight[] = [];

  try {
    highlights = await HomeHighlightsService.getCityHighlights();
  } catch (error) {
    console.error("No se pudieron cargar los destacados de inicio:", error);
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-20 pb-24 sm:px-6 lg:px-8">
      {/* <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-blue-light-200 bg-blue-light-50 px-4 py-1 text-sm font-semibold text-blue-light-600">
            Encuentra tu proximo destino
          </span>
          <h1 className="text-4xl font-bold text-gray-dark-900 sm:text-5xl">
            Propiedades seleccionadas para tu siguiente viaje
          </h1>
          <p className="max-w-xl text-lg text-gray-dark-500">
            Descubre alojamientos destacados en las ciudades con mayor demanda. Explora, compara y reserva con confianza.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-blue-vivid-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-vivid-600"
            >
              Buscar propiedades
            </Link>
            <Link
              href="/host"
              className="inline-flex items-center justify-center rounded-full border border-blue-light-200 px-6 py-3 text-sm font-semibold text-gray-dark-700 transition-colors hover:border-blue-light-300"
            >
              Conviertete en anfitrion
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {HERO_CARDS.map((card, index) => (
            <div
              key={card.title}
              className={`flex h-40 w-full flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl ${card.className} ${index === 1 ? 'translate-y-6' : ''}`}
            >
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-sm text-white/80">{card.description}</p>
            </div>
          ))}
        </div>
      </section> */}

      <section className="space-y-6">
        {/* <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-gray-dark-900">Destinos populares</h2>
          <p className="text-sm text-gray-dark-500">
            Inspirate con estos destinos que los viajeros aman.
          </p>
        </header> */}

        <div className="space-y-12">
          {highlights.length === 0 ? (
            <div className="border-blue-light-100 bg-blue-light-50 text-gray-dark-500 rounded-3xl border px-6 py-8 text-center">
              Aun no hay propiedades destacadas disponibles. Vuelve pronto para
              descubrir nuevos alojamientos.
            </div>
          ) : (
            highlights.map((group) => (
              <CityCarousel key={group.city} {...group} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
