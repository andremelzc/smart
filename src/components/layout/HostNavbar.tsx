"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Home,
  Calendar,
  DollarSign,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "@/src/components/layout/UserMenu";
import { authService } from "@/src/services/auth.service";

export default function HostNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="w-full bg-blue-light-100">
      {/* Navbar Container */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Left Side - Logo + Host Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/host"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Home className="w-8 h-8 text-blue-light-600" />
              <h1 className="text-xl font-bold text-gray-dark-700">smart</h1>
              <span className="text-sm font-medium text-blue-light-600 bg-blue-light-200 px-2 py-1 rounded-full">
                Host
              </span>
            </Link>

            {/* Host Navigation Links - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/host/dashboard"
                className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                href="/host/properties"
                className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Propiedades
              </Link>

              <Link
                href="/host/bookings"
                className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium"
              >
                <Calendar className="w-4 h-4" />
                Reservas
              </Link>

              <Link
                href="/host/earnings"
                className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium"
              >
                <DollarSign className="w-4 h-4" />
                Ganancias
              </Link>
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Menu Button Container with Dropdown */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="primary"
                size="md"
                iconOnly
                leftIcon={Menu}
                aria-label="Menú"
                onClick={handleMenuToggle}
              />
              {/* User Menu Dropdown */}
              {isMenuOpen && (
                <UserMenu
                  role={user?.roles?.includes("host") ? "host" : "tenant"}
                  isAuthenticated={isAuthenticated}
                  onLogout={() => authService.signOut()}
                  onClose={() => setIsMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Shown when menu is open or always visible on mobile */}
        <div className="lg:hidden mt-4 pt-4 border-t border-blue-light-200">
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              href="/host/dashboard"
              className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium text-sm"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href="/host/properties"
              className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium text-sm"
            >
              <Home className="w-4 h-4" />
              Propiedades
            </Link>

            <Link
              href="/host/bookings"
              className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium text-sm"
            >
              <Calendar className="w-4 h-4" />
              Reservas
            </Link>

            <Link
              href="/host/earnings"
              className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium text-sm"
            >
              <DollarSign className="w-4 h-4" />
              Ganancias
            </Link>

            <Link
              href="/host/settings"
              className="flex items-center gap-2 text-gray-dark-600 hover:text-blue-light-600 transition-colors font-medium text-sm"
            >
              <Settings className="w-4 h-4" />
              Config
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
