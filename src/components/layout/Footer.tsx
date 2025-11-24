import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Columna 1: Asistencia */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Asistencia</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/help-center" className="hover:underline">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:underline">
                  Apoyo a personas con discapacidad
                </Link>
              </li>
              <li>
                <Link href="/cancellation-options" className="hover:underline">
                  Opciones de cancelación
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 2: Modo Anfitrión */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Modo Anfitrión</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/host" className="hover:underline">
                  Pon tu espacio en Smart
                </Link>
              </li>
              <li>
                <Link href="/host-resources" className="hover:underline">
                  Recursos para anfitriones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Smart */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Smart</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/press" className="hover:underline">
                  Sala de prensa
                </Link>
              </li>
              <li>
                <Link href="/new-features" className="hover:underline">
                  Funciones nuevas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Políticas */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Políticas</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/commission-policy" className="hover:underline">
                  Política de comisiones (10%)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/trust-safety" className="hover:underline">
                  Confianza y seguridad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 md:flex-row">
          <div className="flex flex-wrap gap-2">
            <span>© 2024 Smart, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link href="/privacy" className="hover:underline">
              Privacidad
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="/terms" className="hover:underline">
              Términos
            </Link>
            <span className="hidden md:inline">·</span>
            <Link href="/help-center" className="hover:underline">
              Mapa del sitio
            </Link>
          </div>

          <div className="flex items-center gap-4 font-semibold text-gray-900">
            <button className="flex items-center gap-2 hover:underline">
              <Globe className="h-4 w-4" />
              Español (PE)
            </button>
            <button className="hover:underline">PEN S/</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
