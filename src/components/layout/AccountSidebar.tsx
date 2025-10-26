"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard, 
  Settings,
  Heart,
  Calendar,
  IdCard
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

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
    icon: IdCard,
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

// Items adicionales solo para hosts
const hostItems = [
  {
    name: "Pagos y facturación",
    href: "/account/billing",
    icon: CreditCard,
    description: "Métodos de pago y facturas",
    disabled: true,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isHost = user?.roles?.includes('host');

  // Combinar items base con items de host si es necesario
  const allItems = isHost ? [...sidebarItems, ...hostItems] : sidebarItems;

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 min-h-full">
      <div className="p-6 lg:p-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Configuración
        </h3>
        
        <nav className="space-y-2">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-start gap-3.5 px-4 py-3.5 rounded-xl text-gray-dark-300 cursor-not-allowed bg-white/40 border border-blue-light-100"
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-dark-300 mt-0.5">
                      Próximamente
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-start gap-3.5 px-4 py-3.5 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-white shadow-md border-l-4 border-blue-light-500 text-blue-light-700' 
                    : 'text-gray-dark-600 hover:bg-white hover:text-blue-light-700 hover:shadow-sm border border-transparent hover:border-blue-light-100'
                  }
                `}
              >
                <Icon 
                  className={`
                    w-5 h-5 mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110
                    ${isActive ? 'text-blue-light-600' : 'text-gray-dark-400'}
                  `} 
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className={`
                    text-xs mt-1 
                    ${isActive ? 'text-blue-light-600' : 'text-gray-dark-400'}
                  `}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info Card */}
        <div className="mt-8 p-5 bg-white rounded-2xl shadow-sm border border-blue-light-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Usuario"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-light-100"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-light-400 to-blue-light-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-dark-700 truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-dark-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
          
          {isHost && (
            <div className="mt-4 pt-4 border-t border-blue-light-100">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-vivid-500 to-blue-vivid-600 text-white shadow-sm">
                Anfitrión
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
