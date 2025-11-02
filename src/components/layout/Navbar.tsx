"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, Home, MapPin, Calendar, Users, Bell, Settings } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "@/src/components/layout/UserMenu";
import { authService } from "@/src/services/auth.service";
import { LocationPopover, LOCATION_OPTIONS, type LocationOption } from "@/src/components/layout/search/LocationPopover";
import { DatePopover } from "@/src/components/layout/search/DatePopover";
import { GuestPopover, GUEST_FIELDS } from "@/src/components/layout/search/GuestPopover";

export default function Navbar() {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [checkInDate, setCheckInDate] = useState<string | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<string | undefined>(undefined);
  const [guestCounts, setGuestCounts] = useState({ adults: 0, children: 0, babies: 0, pets: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0); // Para futuro uso
  const [activeSearchPanel, setActiveSearchPanel] = useState<"location" | "dates" | "guests" | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";

  const toggleSearchPanel = (panel: "location" | "dates" | "guests") => {
    setActiveSearchPanel((prev) => (prev === panel ? null : panel));
  };

  const formatDisplayDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  };

  const dateSummary = (() => {
    const start = formatDisplayDate(checkInDate);
    const end = formatDisplayDate(checkOutDate);
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return "Agrega fechas";
  })();

  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.babies;
  const guestSummary = totalGuests > 0
    ? `${totalGuests} huésped${totalGuests > 1 ? "es" : ""}${guestCounts.pets ? ` · ${guestCounts.pets} mascota${guestCounts.pets > 1 ? "s" : ""}` : ""}`
    : "¿Cuántos?";

  const locationSummary = selectedLocation?.title ?? "Explora destinos";
  const locationDescription = selectedLocation?.subtitle ?? "Descubre qué hay cerca de ti";
  const locationTextClass = selectedLocation ? "text-gray-dark-700" : "text-gray-dark-300";
  const dateTextClass = checkInDate || checkOutDate ? "text-gray-dark-700" : "text-gray-dark-300";
  const guestTextClass = (totalGuests > 0 || guestCounts.pets > 0) ? "text-gray-dark-700" : "text-gray-dark-300";

  const adjustGuestCount = (key: keyof typeof guestCounts, delta: number) => {
    setGuestCounts((prev) => {
      const nextValue = Math.max(0, prev[key] + delta);
      return { ...prev, [key]: nextValue };
    });
  };

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

  useEffect(() => {
    if (!activeSearchPanel) {
      return;
    }

    const handleClickOutsideSearch = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveSearchPanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSearch);
    };
  }, [activeSearchPanel]);

  const handleSearch = () => {
    setActiveSearchPanel(null);
    router.push("/search");
  };

  const handleFilterToggle = () => {
    setActiveSearchPanel(null);
    window.dispatchEvent(new CustomEvent("toggle-search-filters"));
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNotificationsClick = () => {
    console.log("Notificaciones clickeadas");
    // Aquí irá la lógica para mostrar notificaciones
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
            <div ref={searchBarRef} className="relative w-full">
              <div className="w-full flex items-stretch rounded-full border border-blue-light-200 hover:border-blue-light-300 transition-colors bg-white shadow-sm hover:shadow-md">
                {/* Dónde */}
                <div className={`relative flex-1 flex items-center gap-3 px-6 py-4 min-w-0 ${activeSearchPanel === "location" ? "bg-blue-light-50" : ""}`}>
                  <MapPin className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("location")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                      Dónde
                    </span>
                    <span className={`block truncate text-sm font-medium ${locationTextClass}`}>
                      {locationSummary}
                    </span>
                    <span className="block text-xs text-gray-dark-400">
                      {locationDescription}
                    </span>
                  </button>

                  {activeSearchPanel === "location" && (
                    <LocationPopover
                      onSelect={(option) => {
                        setSelectedLocation(option);
                        setActiveSearchPanel(null);
                      }}
                    />
                  )}
                </div>

                <div className="w-px bg-blue-light-150 self-center h-12"></div>

                {/* Fechas */}
                <div className={`relative flex-1 flex items-center gap-3 px-6 py-4 min-w-0 ${activeSearchPanel === "dates" ? "bg-blue-light-50" : ""}`}>
                  <Calendar className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("dates")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                      Fechas
                    </span>
                    <span className={`block truncate text-sm font-medium ${dateTextClass}`}>
                      {dateSummary}
                    </span>
                    <span className="block text-xs text-gray-dark-400">
                      {checkInDate && checkOutDate ? "Rango seleccionado" : "Agrega fechas de ingreso y salida"}
                    </span>
                  </button>
                </div>

                <div className="w-px bg-blue-light-150 self-center h-12"></div>

                {/* Quién + Search Button */}
                <div className={`relative flex items-center gap-2 pl-6 pr-3 py-3 ${activeSearchPanel === "guests" ? "bg-blue-light-50" : ""}`}>
                  <Users className="w-5 h-5 text-blue-light-400 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("guests")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-1">
                      Quién
                    </span>
                    <span className={`block truncate text-sm font-medium ${guestTextClass}`}>
                      {guestSummary}
                    </span>
                    <span className="block text-xs text-gray-dark-400">
                      Añade huéspedes
                    </span>
                  </button>

                  {activeSearchPanel === "guests" && (
                    <GuestPopover
                      counts={guestCounts}
                      onChange={(next) => setGuestCounts(next)}
                    />
                  )}

                  {isSearchPage && (
                    <button
                      onClick={handleFilterToggle}
                      type="button"
                      className="w-12 h-12 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white text-blue-light-600 flex items-center justify-center shadow-sm hover:shadow-md transition-all transform hover:scale-105 ml-2"
                      aria-label="Filtros avanzados"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}

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

              {activeSearchPanel === "dates" && (
                <DatePopover
                  checkIn={checkInDate}
                  checkOut={checkOutDate}
                  onChange={({ checkIn, checkOut }) => {
                    setCheckInDate(checkIn ?? undefined);
                    setCheckOutDate(checkOut ?? undefined);
                  }}
                />
              )}
            </div>
          </div>

          {/* Search Button - Mobile */}
          <div className="lg:hidden flex items-center gap-2 mx-4">
            {isSearchPage && (
              <button
                onClick={handleFilterToggle}
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
                aria-label="Filtros avanzados"
              >
                <Settings className="w-5 h-5 text-blue-light-600" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4 text-blue-light-600" />
              <span className="text-sm font-medium text-gray-dark-600">Buscar</span>
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications Button */}
            <button
              onClick={handleNotificationsClick}
              className="relative p-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-gray-dark-600" />
              {/* Badge para notificaciones no leídas */}
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>

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
          <div className="flex flex-col gap-5 p-5 rounded-2xl border border-blue-light-200 bg-white shadow-sm">
            {/* Dónde */}
            <div>
              <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-2">
                Dónde
              </label>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
                <select
                  value={selectedLocation?.id ?? ""}
                  onChange={(event) => {
                    const option = LOCATION_OPTIONS.find((item) => item.id === event.target.value);
                    setSelectedLocation(option ?? null);
                  }}
                  className="flex-1 rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-sm font-medium text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                >
                  <option value="">Explora destinos</option>
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide mb-2">
                Fechas
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
                  <input
                    type="date"
                    value={checkInDate ?? ""}
                    onChange={(event) => setCheckInDate(event.target.value || undefined)}
                    className="flex-1 rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-sm font-medium text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-light-500 flex-shrink-0" />
                  <input
                    type="date"
                    value={checkOutDate ?? ""}
                    onChange={(event) => setCheckOutDate(event.target.value || undefined)}
                    className="flex-1 rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-sm font-medium text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>
              </div>
            </div>

            {/* Quién */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-dark-400 mb-2">Quién</p>
              <div className="space-y-3">
                {GUEST_FIELDS.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-dark-700">{label}</p>
                      <p className="text-xs text-gray-dark-500">{description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustGuestCount(key, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300"
                        aria-label={`Disminuir ${label}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-dark-700">
                        {guestCounts[key]}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustGuestCount(key, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300"
                        aria-label={`Incrementar ${label}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
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