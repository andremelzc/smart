"use client";

import React from "react";
import Link from "next/link";
import {
  UserCircle,
  LogOut,
  CalendarDays,
  Home,
} from "lucide-react";

// Props que recibe del Navbar
interface UserMenuProps {
  isAuthenticated: boolean; // Estado de autenticación
  onLogout: () => void; // Función para hacer logout
  onClose: () => void; // Función para decirle al Navbar que se cierre
}

// Este componente AHORA SÍ es solo el "dropdown"
export default function UserMenu({
  isAuthenticated,
  onLogout,
  onClose,
}: UserMenuProps) {

  // Función wrapper para que al hacer clic en un link, se cierre el menú
  const handleClickLink = () => {
    onClose();
  };
  
  // Función wrapper para el logout
  const handleLogoutClick = () => {
    onLogout();
    onClose();
  }

  return (
    // El contenedor posicionado (se alinea con el 'relative' del Navbar)
    <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-50">
      {isAuthenticated ? (
        // --- MENÚ AUTENTICADO ---
        <>
          <Link href="/bookings" onClick={handleClickLink} className="block px-4 py-2 text-sm font-semibold text-gray-dark-700 hover:bg-gray-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Mis Reservas
          </Link>
          <Link href="/profile" onClick={handleClickLink} className="block px-4 py-2 text-sm text-gray-dark-700 hover:bg-gray-100 flex items-center gap-2">
              <UserCircle className="w-4 h-4" /> Mi Perfil
          </Link>
          
          <div className="border-t border-gray-100 my-2"></div>
          
          <Link href="/host/become" onClick={handleClickLink} className="block px-4 py-2 text-sm text-gray-dark-700 hover:bg-gray-100 flex items-center gap-2">
              <Home className="w-4 h-4" /> Conviértete en anfitrión
          </Link>
          
          <div className="border-t border-gray-100 my-2"></div>
          
          <button
            onClick={handleLogoutClick}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </>
      ) : (
        // --- MENÚ INVITADO ---
        <>
          <Link href="/login" onClick={handleClickLink} className="block px-4 py-2 text-sm font-semibold text-gray-dark-700 hover:bg-gray-100">
              Iniciar Sesión
          </Link>
          <Link href="/register" onClick={handleClickLink} className="block px-4 py-2 text-sm text-gray-dark-700 hover:bg-gray-100">
              Registrarse
          </Link>

          <div className="border-t border-gray-100 my-2"></div>
          
          <Link href="/host/become" onClick={handleClickLink} className="block px-4 py-2 text-sm text-gray-dark-700 hover:bg-gray-100">
              Conviértete en anfitrión
          </Link>
        </>
      )}
    </div>
  );
}