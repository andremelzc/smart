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
  isAuthenticated: boolean; // Estado de autenticacion

  onLogout: () => void; // Funcion para hacer logout

  onClose: () => void; // Funcion para decirle al Navbar que se cierre

  role: string | null; // Rol del usuario
}

// Este componente AHORA SI es solo el "dropdown"

export default function UserMenu({
  isAuthenticated,

  onLogout,

  onClose,

  role,
}: UserMenuProps) {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Funcion wrapper para que al hacer clic en un link, se cierre el menu

  const handleClickLink = () => {
    onClose();
  };

  // Funcion wrapper para el logout

  const handleLogoutClick = () => {
    onLogout();

    onClose();
  };

  // Funcion para abrir el modal SIN cerrar el menu

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsModalOpen(true);

    // NO llamar a onClose() aqui
  };

  return (
    <>
      {/* El contenedor posicionado con animacion */}

      <div
        className="animate-fadeInDown absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5"
        role="menu"
        aria-label={isAuthenticated ? "Menu de usuario" : "Menu de invitado"}
        style={{
          animation: "fadeInDown 0.2s ease-out forwards",
        }}
      >
        {isAuthenticated ? (
          role === "tenant" ? (
            // --- MENU TENANT/HUESPED ---

            <>
              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <User className="h-5 w-5" /> Mi perfil publico
              </Link>

              <Link
                href="/account/personal-info"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <FileText className="h-5 w-5" /> Informacion personal
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/account/reservas"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Calendar className="h-5 w-5" /> Mis reservas
              </Link>

              <Link
                href="/account/messages"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <MessageSquare className="h-5 w-5" /> Mensajes
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/account/notifications"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Bell className="h-5 w-5" /> Notificaciones
              </Link>

              <Link
                href="/account/security"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Shield className="h-5 w-5" /> Privacidad y seguridad
              </Link>

              {user?.isHost && (
                <>
                  <Link
                    href="/account/billing"
                    onClick={handleClickLink}
                    className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    role="menuitem"
                  >
                    <CreditCard className="h-5 w-5" /> Pagos y facturacion
                  </Link>
                </>
              )}

              <div className="my-2 border-t border-gray-200"></div>

              {user?.isHost ? (
                <Link
                  href="/host/dashboard"
                  onClick={handleClickLink}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  role="menuitem"
                >
                  <Building2 className="h-5 w-5" />
                  Cambia a anfitrion
                </Link>
              ) : (
                <button
                  onClick={handleOpenModal}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  role="menuitem"
                  type="button"
                >
                  <Building2 className="h-5 w-5" />
                  Conviertete en anfitrion
                </button>
              )}

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/help"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <HelpCircle className="h-5 w-5" /> Centro de ayuda
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <button
                onClick={handleLogoutClick}
                className="flex w-full cursor-pointer items-center gap-3 rounded-b-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                role="menuitem"
                type="button"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesion
              </button>
            </>
          ) : (
            // --- MENU HOST/ANFITRION ---

            <>
              <Link
                href="/host/dashboard"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Home className="h-5 w-5" /> Dashboard de host
              </Link>

              <Link
                href="/host/properties"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Building2 className="h-5 w-5" /> Mis recintos
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/host/bookings"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Calendar className="h-5 w-5" /> Reservas y calendario
              </Link>

              <Link
                href="/host/messages"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <MessageSquare className="h-5 w-5" /> Mensajes con huespedes
              </Link>

              <Link
                href="/host/reviews"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Star className="h-5 w-5" /> Resenas de huespedes
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/account/profile"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <User className="h-5 w-5" /> Mi perfil publico
              </Link>

              <Link
                href="/host/notifications"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <Bell className="h-5 w-5" /> Notificaciones
              </Link>

              <Link
                href="/account/billing"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <CreditCard className="h-5 w-5" /> Pagos y facturacion
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/"
                onClick={handleClickLink}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                role="menuitem"
              >
                <Users className="h-5 w-5" />
                Cambia a huesped
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <Link
                href="/help"
                onClick={handleClickLink}
                className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <HelpCircle className="h-5 w-5" /> Centro de ayuda
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-3 rounded-b-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                role="menuitem"
                type="button"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesion
              </button>
            </>
          )
        ) : (
          // --- MENU INVITADO ---

          <>
            <Link
              href="/register"
              onClick={handleClickLink}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              role="menuitem"
            >
              <User className="h-5 w-5" /> Registrarse
            </Link>

            <Link
              href="/login"
              onClick={handleClickLink}
              className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              role="menuitem"
            >
              <LogIn className="h-5 w-5" /> Iniciar sesion
            </Link>

            <div className="my-2 border-t border-gray-200"></div>

            <button
              onClick={handleOpenModal}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              role="menuitem"
              type="button"
            >
              <Building2 className="h-5 w-5" /> Conviertete en anfitrion
            </button>

            <div className="my-2 border-t border-gray-200"></div>

            <Link
              href="/help"
              onClick={handleClickLink}
              className="text-gray-dark-700 flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              role="menuitem"
            >
              <HelpCircle className="h-5 w-5" /> Centro de ayuda
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

      {/* Modal FUERA del menu - se renderiza con Portal */}

      {console.log(" Rendering BecomeHostModal with isOpen:", isModalOpen)}

      <BecomeHostModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log(" Modal onClose called");

          setIsModalOpen(false); //  CORRECTO
        }}
      />
    </>
  );
}
