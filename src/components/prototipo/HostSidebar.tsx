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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

const navigationItems = [
  {
    href: "/prototipo/tarea-facil/dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Resumen general",
  },
  {
    href: "/prototipo/tarea-facil/recintos",
    label: "Propiedades",
    icon: Building2,
    description: "Gestiona tus recintos",
  },
  {
    href: "/prototipo/tarea-facil/reservas",
    label: "Reservas",
    icon: Calendar,
    description: "Reservas y calendario",
  },
];

export default function HostSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isActive = (href: string): boolean => {
    if (href === "/prototipo/tarea-facil/dashboard") {
      return pathname === "/prototipo/tarea-facil" || pathname === "/prototipo/tarea-facil/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
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
    </aside>
  );
}
