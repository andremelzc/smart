"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Bell,
  HelpCircle,
  LogIn,
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
            // --- MENÚ TENANT ---
            <>
              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <User className="w-5 h-5" /> Mi perfil
              </Link>
              <Link
                href="/bookings"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5  text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Calendar className="w-5 h-5" /> Viajes
              </Link>
              <Link
                href="/messages"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <MessageSquare className="w-5 h-5" /> Mensajes
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/account/settings"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Settings className="w-5 h-5" /> Configuración de la cuenta
              </Link>

              <Link
                href="/account/notifications"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Bell className="w-5 h-5" /> Notificaciones
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              {user?.isHost ? (
                <Link
                  href="/host/dashboard"
                  onClick={handleClickLink}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                  role="menuitem"
                >
                  <Home className="w-5 h-5" />
                  Cambia a anfitrión
                </Link>
              ) : (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700  cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors w-full text-left"
                  role="menuitem"
                  type="button"
                >
                  <Home className="w-5 h-5" />
                  Conviértete en anfitrión
                </button>
              )}

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors rounded-b-lg"
                role="menuitem"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            // --- MENÚ HOST U OTRO ROL ---
            <>
              <Link
                href="/messages"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <MessageSquare className="w-5 h-5" /> Mensajes
              </Link>
              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <User className="w-5 h-5" /> Mi perfil
              </Link>
              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/account/settings"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Settings className="w-5 h-5" /> Configuración de la cuenta
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <Link
                href="/"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                role="menuitem"
              >
                <Home className="w-5 h-5" />
                Cambia a huésped
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors rounded-b-lg"
                role="menuitem"
                type="button"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </>
          )
        ) : (
          // --- MENÚ INVITADO ---
          <>
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
              onClick={handleOpenModal}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors w-full text-left"
              role="menuitem"
              type="button"
            >
              <Home className="w-5 h-5" /> Conviértete en anfitrión
            </button>

            <div className="border-t border-gray-200 my-2"></div>

            <Link
              href="/login"
              onClick={handleClickLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-dark-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors rounded-b-lg"
              role="menuitem"
            >
              <LogIn className="w-5 h-5" /> Iniciar sesión o registrarse
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
