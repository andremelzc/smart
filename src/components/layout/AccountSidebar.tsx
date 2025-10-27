"use client";
import React from "react";
import {
  User,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Calendar,
  Home,
  Building2,
  DollarSign,
  Settings,
  BarChart3,
  MessageSquare,
  Star,
  Users,
  ChevronRight,
  FileText,
} from "lucide-react";

// ============================================
// ACCOUNT SIDEBAR - Versión Unificada
// ============================================

const AccountSidebar = () => {
  const [pathname, setPathname] = React.useState("/account/profile");

  const user = {
    name: "María González",
    email: "maria@ejemplo.com",
    image: null,
    roles: ["host"],
  };

  const isHost = user?.roles?.includes("host");

  const sidebarItems = [
    {
      name: "Mi perfil público",
      href: "/account/profile",
      icon: User,
      description: "Información que ven otros usuarios",
    },
    {
      name: "Información personal",
      href: "/account/personal-info",
      icon: FileText,
      description: "Datos privados y verificación",
    },
    {
      name: "Mis viajes",
      href: "/account/trips",
      icon: MapPin,
      description: "Historial de reservas y viajes",
    },
    {
      name: "Mis reservas",
      href: "/account/reservas",
      icon: Calendar,
      description: "Reservas en curso y próximas",
    },
    {
      name: "Notificaciones",
      href: "/account/notifications",
      icon: Bell,
      description: "Configuración de alertas",
      disabled: true,
    },
    {
      name: "Privacidad y seguridad",
      href: "/account/security",
      icon: Shield,
      description: "Contraseña y configuración de seguridad",
      disabled: true,
    },
  ];

  const hostItems = [
    {
      name: "Pagos y facturación",
      href: "/account/billing",
      icon: CreditCard,
      description: "Métodos de pago y facturas",
      disabled: true,
    },
  ];

  const allItems = isHost ? [...sidebarItems, ...hostItems] : sidebarItems;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200">
          <div className="flex items-center gap-4">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Usuario"}
                className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {user?.name || "Usuario"}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">{user?.email}</p>
              {isHost && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    Anfitrión
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-400">{item.name}</div>
                    <div className="text-sm text-gray-400">Próximamente</div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.name}
                onClick={() => setPathname(item.href)}
                className={`
                  w-full group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
                <div className="flex-1 text-left">
                  <div
                    className={`font-medium ${
                      isActive ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </div>
                  <div
                    className={`text-sm ${
                      isActive ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive
                      ? "text-white rotate-90"
                      : "text-gray-400 group-hover:translate-x-1"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AccountSidebar;
