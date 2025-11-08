"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Building2,
  Calendar,
  ChevronRight,
  Star,
  MessageSquare,
  Users,
  Bell
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

const navigationItems = [
  {
    href: "/host/dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Resumen general",
  },
  {
    href: "/host/properties",
    label: "Recintos",
    icon: Building2,
    description: "Gestiona tus recintos",
  },
  {
    href: "/host/reservas",
    label: "Reservas",
    icon: Calendar,
    description: "Listado centralizado",
  },
  {
    href: "/host/reviews",
    label: "Reseñas",
    icon: Star,
    description: "Valoraciones de huéspedes",
  },
  {
    href: "/host/messages",
    label: "Mensajes",
    icon: MessageSquare,
    description: "Comunicación con huéspedes",
  },
  {
    href: "/host/notifications",
    label: "Notificaciones",
    icon: Bell,
    description: "Configuración de alertas",
  },
];

export default function HostSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isActive = (href: string): boolean => {
    if (href === "/host/dashboard") {
      return pathname === "/host" || pathname === "/host/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200">
          <div className="flex items-center gap-4">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Usuario"}
                width={64}
                height={64}
                className="rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
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
                  w-full group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
                <div className="flex-1 text-left">
                  <div
                    className={`font-medium ${
                      active ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-sm ${
                      active ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active
                      ? "text-white rotate-90"
                      : "text-gray-400 group-hover:translate-x-1"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
        </div>
      </div>
    </aside>
  );
}
