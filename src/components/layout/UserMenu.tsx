"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  Calendar,
  Home,
  MessageSquare,
  Bell,
  HelpCircle,
  LogIn,
  Building2,
  Star,
  CreditCard,
  Shield,
  FileText,
  Users,
} from "lucide-react";

import { useAuth } from "@/src/hooks/useAuth";
import BecomeHostModal from "@/src/components/features/host/BecomeHostModal";

// Props que recibe del Navbar
interface UserMenuProps {
  isAuthenticated: boolean; // Estado de autenticación
  onLogout: () => void; // Función para hacer logout
  onClose: () => void; // Función para decirle al Navbar que se cierre
  role: string | null; // Rol del usuario
}

// Este componente AHORA SÍ es solo el "dropdown"
export default function UserMenu({
  isAuthenticated,
  onLogout,
  onClose,
  role,
}: UserMenuProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función wrapper para que al hacer clic en un link, se cierre el menú
  const handleClickLink = () => {
    onClose();
  };

  // Función wrapper para el logout
  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  // Función para abrir el modal SIN cerrar el menú
  const handleOpenModal = (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsModalOpen(true);
  // NO llamar a onClose() aquí
};

  return (
    <>
      {/* El contenedor posicionado con animación */}
      <div
        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-2 z-50 animate-fadeInDown origin-top-right"
        role="menu"
        aria-label={isAuthenticated ? "Menú de usuario" : "Menú de invitado"}
        style={{
          animation: "fadeInDown 0.2s ease-out forwards",
        }}
      >
        {isAuthenticated ? (
          role === "tenant" ? (
            // --- MENÚ TENANT/HUÉSPED ---
            <>
              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <User className="w-5 h-5" /> Mi perfil público
              </Link>
              <Link
                href="/account/personal-info"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <FileText className="w-5 h-5" /> Información personal
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/account/reservas"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5  text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Calendar className="w-5 h-5" /> Mis reservas
              </Link>
              <Link
                href="/account/messages"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <MessageSquare className="w-5 h-5" /> Mensajes
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/account/notifications"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Bell className="w-5 h-5" /> Notificaciones
              </Link>
              <Link
                href="/account/security"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Shield className="w-5 h-5" /> Privacidad y seguridad
              </Link>

              {user?.isHost && (
                <>
                  <Link
                    href="/account/billing"
                    onClick={handleClickLink}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                    role="menuitem"
                  >
                    <CreditCard className="w-5 h-5" /> Pagos y facturación
                  </Link>
                </>
              )}

              <div className="border-t border-gray-200 my-2"></div>

              {user?.isHost ? (
                <Link
                  href="/host/dashboard"
                  onClick={handleClickLink}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                  role="menuitem"
                >
                  <Building2 className="w-5 h-5" />
                  Cambia a anfitrión
                </Link>
              ) : (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors w-full text-left"
                  role="menuitem"
                  type="button"
                >
                  <Building2 className="w-5 h-5" />
                  Conviértete en anfitrión
                </button>
              )}

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/help"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <HelpCircle className="w-5 h-5" /> Centro de ayuda
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors rounded-b-lg"
                role="menuitem"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </>
          ) : (
            // --- MENÚ HOST/ANFITRIÓN ---
            <>
              <Link
                href="/host/dashboard"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Home className="w-5 h-5" /> Dashboard de host
              </Link>
              <Link
                href="/host/properties"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Building2 className="w-5 h-5" /> Mis recintos
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/host/bookings"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Calendar className="w-5 h-5" /> Reservas y calendario
              </Link>
              <Link
                href="/host/messages"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <MessageSquare className="w-5 h-5" /> Mensajes con huéspedes
              </Link>
              <Link
                href="/host/reviews"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Star className="w-5 h-5" /> Reseñas de huéspedes
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <User className="w-5 h-5" /> Mi perfil público
              </Link>
              <Link
                href="/host/notifications"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Bell className="w-5 h-5" /> Notificaciones
              </Link>
              <Link
                href="/account/billing"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <CreditCard className="w-5 h-5" /> Pagos y facturación
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Users className="w-5 h-5" />
                Cambia a huésped
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/help"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <HelpCircle className="w-5 h-5" /> Centro de ayuda
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors rounded-b-lg"
                role="menuitem"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </>
          )
        ) : (
          // --- MENÚ INVITADO ---
          <>
            <Link
              href="/register"
              onClick={handleClickLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              role="menuitem"
            >
              <User className="w-5 h-5" /> Registrarse
            </Link>
            <Link
              href="/login"
              onClick={handleClickLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              role="menuitem"
            >
              <LogIn className="w-5 h-5" /> Iniciar sesión
            </Link>

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={handleOpenModal}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors w-full text-left"
              role="menuitem"
              type="button"
            >
              <Building2 className="w-5 h-5" /> Conviértete en anfitrión
            </button>

            <div className="border-t border-gray-200 my-2"></div>

            <Link
              href="/help"
              onClick={handleClickLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              role="menuitem"
            >
              <HelpCircle className="w-5 h-5" /> Centro de ayuda
            </Link>
          </>
        )}

        <style jsx>{`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>

      {/* Modal FUERA del menú - se renderiza con Portal */}
      {console.log("🔥 Rendering BecomeHostModal with isOpen:", isModalOpen)}
      <BecomeHostModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log("🔥 Modal onClose called");
          setIsModalOpen(false); // ✅ CORRECTO
        }}
      />
    </>
  );
}
