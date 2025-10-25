"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, Home, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "@/src/components/layout/UserMenu";
import { authService } from "@/src/services/auth.service";

export default function Navbar() {
  const [origin, setOrigin] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");
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

  const handleSearch = () => {
    console.log({ origin, departureDate, returnDate, passengers });
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="w-full bg-blue-light-50 border-b border-blue-light-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex items-center justify-between py-5 lg:py-6">
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

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-3xl mx-10">
            <div className="w-full flex items-stretch rounded-full border border-blue-light-200 hover:border-blue-light-300 transition-colors bg-white shadow-sm hover:shadow-md">
              {/* Dónde */}
              <div className="flex-1 flex items-center gap-3 px-6 py-4 min-w-0">
                <MapPin className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                    Dónde
                  </label>
                  <input
                    type="text"
                    placeholder="Explora destinos"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-sm font-medium text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-dark-300 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="w-px bg-blue-light-150 self-center h-12"></div>

              {/* Fechas */}
              <div className="flex-1 flex items-center gap-3 px-6 py-4 min-w-0">
                <Calendar className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                    Fechas
                  </label>
                  <input
                    type="text"
                    placeholder="Agrega fechas"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    className="w-full text-sm font-medium text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-dark-300 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="w-px bg-blue-light-150 self-center h-12"></div>

              {/* Quién + Search Button */}
              <div className="flex items-center gap-2 pl-6 pr-3 py-3">
                <Users className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                <div className="flex-1 min-w-0 py-1">
                  <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                    Quién
                  </label>
                  <input
                    type="text"
                    placeholder="¿Cuántos?"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full text-sm font-medium text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-dark-300 placeholder:font-normal"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105 ml-3"
                  aria-label="Buscar"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Button - Mobile */}
          <button
            onClick={handleSearch}
            className="lg:hidden flex items-center gap-2 px-5 py-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all mx-4"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4 text-blue-light-600" />
            <span className="text-sm font-medium text-gray-dark-600">Buscar</span>
          </button>

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
                    {isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {isMenuOpen && (
                <UserMenu
                  role={"tenant"}
                  isAuthenticated={isAuthenticated}
                  onLogout={() => authService.signOut()}
                  onClose={() => setIsMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-5">
          <div className="flex flex-col gap-4 p-5 rounded-2xl border border-blue-light-200 bg-white shadow-sm">
            {/* Dónde */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1.5">
                  Dónde
                </label>
                <input
                  type="text"
                  placeholder="Explora destinos"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-dark-700 bg-blue-light-50 border border-blue-light-150 rounded-xl outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100 placeholder:text-gray-dark-300 transition-all"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1.5">
                  Fechas
                </label>
                <input
                  type="text"
                  placeholder="Agrega fechas"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !e.target.value && (e.target.type = "text")}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-dark-700 bg-blue-light-50 border border-blue-light-150 rounded-xl outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100 placeholder:text-gray-dark-300 transition-all"
                />
              </div>
            </div>

            {/* Quién */}
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1.5">
                  Quién
                </label>
                <input
                  type="text"
                  placeholder="¿Cuántos?"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-dark-700 bg-blue-light-50 border border-blue-light-150 rounded-xl outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100 placeholder:text-gray-dark-300 transition-all"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="mt-2 w-full py-4 rounded-xl bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}