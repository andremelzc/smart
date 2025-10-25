"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Home,
  Calendar,
  DollarSign,
  Settings,
  Building2,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "@/src/components/layout/UserMenu";
import { authService } from "@/src/services/auth.service";

export default function HostNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();

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
    <nav className="w-full bg-blue-light-50 border-b border-blue-light-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex items-center justify-between py-5 lg:py-6">
          {/* Left Side - Logo + Host Navigation */}
          <div className="flex items-center gap-8 lg:gap-12 flex-1">
            {/* Logo */}
            <Link
              href="/host"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-light-500 to-blue-light-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-blue-light-700 hidden sm:block">
                  smart
                </h1>
                <span className="text-xs font-bold text-blue-light-600 bg-blue-light-100 px-3 py-1.5 rounded-full border border-blue-light-200">
                  HOST
                </span>
              </div>
            </Link>

            {/* Host Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/host/dashboard"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-dark-600 hover:text-blue-light-700 hover:bg-white transition-all font-medium group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/host/properties"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-dark-600 hover:text-blue-light-700 hover:bg-white transition-all font-medium group"
              >
                <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Propiedades</span>
              </Link>

              <Link
                href="/host/bookings"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-dark-600 hover:text-blue-light-700 hover:bg-white transition-all font-medium group"
              >
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Reservas</span>
              </Link>

              <Link
                href="/host/earnings"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-gray-dark-600 hover:text-blue-light-700 hover:bg-white transition-all font-medium group"
              >
                <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Ganancias</span>
              </Link>
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Menu Button with Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5 text-gray-dark-600" />
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-light-400 to-blue-light-500 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">
                    {isAuthenticated && user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>
              </button>

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

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-5 border-t border-blue-light-100 pt-4">
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Link
              href="/host/dashboard"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-gray-dark-600 hover:text-blue-light-700 bg-white hover:bg-blue-light-100 transition-all font-medium text-sm border border-blue-light-100 hover:border-blue-light-200 shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/host/properties"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-gray-dark-600 hover:text-blue-light-700 bg-white hover:bg-blue-light-100 transition-all font-medium text-sm border border-blue-light-100 hover:border-blue-light-200 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Propiedades</span>
            </Link>

            <Link
              href="/host/bookings"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-gray-dark-600 hover:text-blue-light-700 bg-white hover:bg-blue-light-100 transition-all font-medium text-sm border border-blue-light-100 hover:border-blue-light-200 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservas</span>
            </Link>

            <Link
              href="/host/earnings"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-gray-dark-600 hover:text-blue-light-700 bg-white hover:bg-blue-light-100 transition-all font-medium text-sm border border-blue-light-100 hover:border-blue-light-200 shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span>Ganancias</span>
            </Link>

            <Link
              href="/host/settings"
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-gray-dark-600 hover:text-blue-light-700 bg-white hover:bg-blue-light-100 transition-all font-medium text-sm border border-blue-light-100 hover:border-blue-light-200 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Config</span>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}