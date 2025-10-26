"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  MessageSquare,
  Star,
  Users,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export default function HostSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    {
      href: "/host/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Resumen general"
    },
    {
      href: "/host/properties", 
      label: "Propiedades",
      icon: Building2,
      description: "Gestiona tus alojamientos"
    },
    {
      href: "/host/bookings",
      label: "Reservas",
      icon: Calendar,
      description: "Reservas y calendario"
    },
    {
      href: "/host/earnings",
      label: "Ganancias",
      icon: DollarSign,
      description: "Ingresos y pagos"
    },
    {
      href: "/host/reviews",
      label: "Reseñas",
      icon: Star,
      description: "Valoraciones de huéspedes"
    },
    {
      href: "/host/messages",
      label: "Mensajes",
      icon: MessageSquare,
      description: "Comunicación con huéspedes"
    },
    {
      href: "/host/analytics",
      label: "Análisis",
      icon: BarChart3,
      description: "Métricas y estadísticas"
    },
    {
      href: "/host/settings",
      label: "Configuración",
      icon: Settings,
      description: "Ajustes de la cuenta"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/host/dashboard") {
      return pathname === "/host" || pathname === "/host/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200">
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Usuario"}
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {user?.name || "Usuario"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Anfitrión
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>245 huéspedes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`} />
                <div className="flex-1">
                  <div className={`font-medium ${active ? "text-white" : "text-gray-900"}`}>
                    {item.label}
                  </div>
                  <div className={`text-sm ${active ? "text-blue-100" : "text-gray-500"}`}>
                    {item.description}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${active ? "text-white rotate-90" : "text-gray-400 group-hover:translate-x-1"}`} />
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats Card */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">
            Resumen del mes
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ingresos</span>
              <span className="font-semibold text-green-600">$2,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reservas</span>
              <span className="font-semibold text-blue-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ocupación</span>
              <span className="font-semibold text-gray-900">78%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}