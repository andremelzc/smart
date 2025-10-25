import React from "react";
import Link from "next/link";
import { Home, Calendar, DollarSign, Settings } from "lucide-react";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Host Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/host/dashboard" className="font-bold text-xl text-blue-600">
                Smart Host
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/host/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                
                <Link
                  href="/host/properties"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Propiedades
                </Link>
                
                <Link
                  href="/host/bookings"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Reservas
                </Link>
                
                <Link
                  href="/host/earnings"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Ganancias
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                Volver al sitio principal
              </Link>
              
              <Link
                href="/host/settings"
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}