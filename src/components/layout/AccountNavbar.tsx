"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "@/src/components/layout/UserMenu";
import { authService } from "@/src/services/auth.service";

export default function AccountNavbar() {
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
          {/* Left Side - Logo + Account Title */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-light-500 to-blue-light-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-blue-light-700 hidden sm:block">
                smart
              </h1>
            </Link>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Back Button - Mobile */}
            <Link href="/" className="md:hidden">
              <button
                className="w-11 h-11 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-center group"
                aria-label="Volver al inicio"
              >
                <ArrowLeft className="w-5 h-5 text-gray-dark-600 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </Link>

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
      </div>
    </nav>
  );
}