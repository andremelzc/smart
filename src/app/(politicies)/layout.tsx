import Link from "next/link";
import { Home } from "lucide-react";
import { Footer } from "@/src/components/layout/Footer";

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Simple Navbar para páginas de políticas */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link
              href="/"
              className="group flex flex-shrink-0 items-center gap-3"
            >
              <div className="from-blue-light-500 to-blue-light-600 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
                <Home className="h-5 w-5 text-white" />
              </div>

              <h1 className="text-blue-light-700 text-xl font-bold">smart</h1>
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenido principal con max-width */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <main className="min-h-screen py-8">{children}</main>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
