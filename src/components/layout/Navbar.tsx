"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import Link from "next/link";

import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";

import {
  Search,
  Menu,
  Home,
  MapPin,
  Calendar,
  Users,
  Bell,
  Settings,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/src/hooks/useAuth";

import UserMenu from "@/src/components/layout/UserMenu";

import { authService } from "@/src/services/auth.service";

import {
  LocationPopover,
  LOCATION_OPTIONS,
  type LocationOption,
} from "@/src/components/layout/search/LocationPopover";

import { DatePopover } from "@/src/components/layout/search/DatePopover";

import {
  GuestPopover,
  GUEST_FIELDS,
} from "@/src/components/layout/search/GuestPopover";
import type { NotificationItem } from "@/src/types/dtos/notifications.dto";

export default function Navbar() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationOption | null>(null);

  const [checkInDate, setCheckInDate] = useState<string | undefined>(undefined);

  const [checkOutDate, setCheckOutDate] = useState<string | undefined>(
    undefined
  );

  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    children: 0,
    babies: 0,
    pets: 0,
  });

  // Clear handlers for each popover
  const clearLocation = () => {
    setSelectedLocation(null);
    setActiveSearchPanel(null);
  };

  const clearDates = () => {
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
  };

  const clearGuests = () => {
    setGuestCounts({
      adults: 0,
      children: 0,
      babies: 0,
      pets: 0,
    });
  };

  const formatDate = useCallback((dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      const months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ];

      return `${parseInt(day)} ${months[date.getMonth()]}`;
    } catch {
      return dateString;
    }
  }, []);

  // Calcular total de huéspedes
  const totalGuests = useMemo(
    () =>
      guestCounts.adults +
      guestCounts.children +
      guestCounts.babies +
      guestCounts.pets,
    [guestCounts]
  );

  // Función para obtener resumen de huéspedes
  const getGuestSummary = () => {
    const parts: string[] = [];

    if (guestCounts.adults > 0) {
      parts.push(
        `${guestCounts.adults} ${
          guestCounts.adults === 1 ? "adulto" : "adultos"
        }`
      );
    }
    if (guestCounts.children > 0) {
      parts.push(
        `${guestCounts.children} ${
          guestCounts.children === 1 ? "niño" : "niños"
        }`
      );
    }
    if (guestCounts.babies > 0) {
      parts.push(
        `${guestCounts.babies} ${guestCounts.babies === 1 ? "bebé" : "bebés"}`
      );
    }
    if (guestCounts.pets > 0) {
      parts.push(
        `${guestCounts.pets} ${guestCounts.pets === 1 ? "mascota" : "mascotas"}`
      );
    }

    return parts.slice(0, 2).join(", "); // Mostrar máximo 2 categorías
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);

  const [activeSearchPanel, setActiveSearchPanel] = useState<
    "location" | "dates" | "guests" | null
  >(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const searchBarRef = useRef<HTMLDivElement>(null);

  const notificationsContainerRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuth();

  const router = useRouter();

  const pathname = usePathname();

  const isSearchPage = pathname === "/search";

  const formatNotificationDate = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        return "";
      }
      try {
        return new Date(value).toLocaleString("es-PE", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return value;
      }
    },
    []
  );

  const statusLabels = useMemo(
    () => ({
      PENDING: "Pendiente",
      ACCEPTED: "Aceptada",
      DECLINED: "Rechazada",
      CANCELLED: "Cancelada",
      COMPLETED: "Completada",
    }),
    []
  );

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setIsFetchingNotifications(true);
    try {
      const response = await fetch("/api/account/notifications", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const payload = await response.json();
      const items: NotificationItem[] = Array.isArray(payload?.data)
        ? payload.data
        : [];
      setNotifications(items);
    } catch (error) {
      console.error("Error al cargar notificaciones en Navbar:", error);
    } finally {
      setIsFetchingNotifications(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    void fetchNotifications();
  }, [fetchNotifications, isAuthenticated]);

  useEffect(() => {
    setIsNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        notificationsContainerRef.current &&
        !notificationsContainerRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  const newNotificationCount = useMemo(
    () =>
      notifications.filter(
        (item) =>
          item.status === "PENDING" || item.reminderType === "CHECKIN_24H"
      ).length,
    [notifications]
  );

  const hasNewNotifications = newNotificationCount > 0;

  const recentNotifications = useMemo(
    () => notifications.slice(0, 6),
    [notifications]
  );

  const handleNotificationsClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);
    if (!isNotificationsOpen) {
      void fetchNotifications();
    }
  };

  const handleNotificationNavigate = (notification: NotificationItem) => {
    setIsNotificationsOpen(false);
    if (notification.role === "host") {
      router.push("/host/notifications");
    } else {
      router.push("/account/notifications");
    }
  };

  const toggleSearchPanel = (panel: "location" | "dates" | "guests") => {
    setActiveSearchPanel((prev) => (prev === panel ? null : panel));
  };

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
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
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

    const params = new URLSearchParams();

    if (selectedLocation?.value) {
      params.set("city", selectedLocation.value);
    }

    if (checkInDate) {
      params.set("startDate", checkInDate);
    }

    if (checkOutDate) {
      params.set("endDate", checkOutDate);
    }

    if (guestCounts.adults > 0) {
      params.set("adults", String(guestCounts.adults));
    }

    if (guestCounts.children > 0) {
      params.set("children", String(guestCounts.children));
    }

    if (guestCounts.babies > 0) {
      params.set("babies", String(guestCounts.babies));
    }

    if (guestCounts.pets > 0) {
      params.set("pets", String(guestCounts.pets));
    }

    const query = params.toString();

    router.push(query ? `/search?${query}` : "/search");
  };

  const handleFilterToggle = () => {
    setActiveSearchPanel(null);
    // Si no estamos en /search navegamos con un flag para abrir filtros al montar
    if (pathname !== "/search") {
      router.push("/search?openFilters=1");
      return;
    }
    // Ya en /search: disparamos el evento directamente
    window.dispatchEvent(new CustomEvent("toggle-search-filters"));
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

          <div className="hidden lg:flex flex-1 max-w-3xl mx-10 items-center gap-4">
            <div ref={searchBarRef} className="relative flex-1">
              <div className="w-full flex items-stretch rounded-full border border-blue-light-200 hover:border-blue-light-300 transition-colors bg-white shadow-sm hover:shadow-md">
                {/* Donde */}

                <div
                  className={`relative flex-1 flex items-center gap-3 px-6 py-4 min-w-0 ${
                    activeSearchPanel === "location" ? "bg-blue-light-50" : ""
                  }`}
                >
                  <MapPin className="w-5 h-5 text-blue-light-400 flex-shrink-0" />

                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("location")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-md font-semibold tracking-wide text-gray-dark-600">
                      Dónde
                    </span>
                    <span
                      className={`block text-sm font-semibold truncate ${
                        selectedLocation
                          ? "text-gray-dark-400"
                          : "text-gray-dark-400"
                      }`}
                    >
                      {selectedLocation?.title || "Agregar ubicación"}
                    </span>
                  </button>

                  {activeSearchPanel === "location" && (
                    <LocationPopover
                      onSelect={(option) => {
                        setSelectedLocation(option);

                        setActiveSearchPanel(null);
                      }}
                      onClear={clearLocation}
                      hasSelection={selectedLocation !== null}
                    />
                  )}
                </div>

                <div className="w-px bg-blue-light-150 self-center h-12"></div>

                {/* Fechas */}

                <div
                  className={`relative flex-1 flex items-center gap-3 px-6 py-4 min-w-0 ${
                    activeSearchPanel === "dates" ? "bg-blue-light-50" : ""
                  }`}
                >
                  <Calendar className="w-5 h-5 text-blue-light-400 flex-shrink-0" />

                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("dates")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-md font-semibold tracking-wide text-gray-dark-600">
                      Fechas
                    </span>
                    <span
                      className={`block text-sm font-semibold truncate ${
                        checkInDate && checkOutDate
                          ? "text-gray-dark-400"
                          : "text-gray-dark-400"
                      }`}
                    >
                      {checkInDate && checkOutDate
                        ? `${formatDate(checkInDate)} - ${formatDate(
                            checkOutDate
                          )}`
                        : "Agregar fechas"}
                    </span>
                  </button>
                </div>

                <div className="w-px bg-blue-light-150 self-center h-12"></div>

                {/* Quien + Search Button */}

                <div
                  className={`relative flex items-center gap-2 pl-6 pr-3 py-3 ${
                    activeSearchPanel === "guests" ? "bg-blue-light-50" : ""
                  }`}
                >
                  <Users className="w-5 h-5 text-blue-light-400 flex-shrink-0" />

                  <button
                    type="button"
                    onClick={() => toggleSearchPanel("guests")}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block text-md font-semibold tracking-wide text-gray-dark-600">
                      Quién
                    </span>
                    <span
                      className={`block text-sm font-semibold truncate ${
                        totalGuests > 0
                          ? "text-gray-dark-400"
                          : "text-gray-dark-400"
                      }`}
                    >
                      {totalGuests > 0
                        ? getGuestSummary()
                        : "Agregar huéspedes"}
                    </span>
                  </button>
                  {activeSearchPanel === "guests" && (
                    <GuestPopover
                      counts={guestCounts}
                      onChange={(next) => setGuestCounts(next)}
                      onClear={clearGuests}
                    />
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
                  onClear={clearDates}
                />
              )}
            </div>

            {isSearchPage && (
              <button
                onClick={handleFilterToggle}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-blue-light-200 bg-white px-5 py-3 text-sm font-semibold text-gray-dark-600 shadow-sm transition-all hover:border-blue-light-300 hover:shadow-md"
                aria-label="Abrir filtros avanzados"
              >
                <Settings className="h-5 w-5 text-blue-light-500" />
                Filtros
              </button>
            )}
          </div>

          {/* Search Button - Mobile */}

          <div className="lg:hidden flex items-center gap-2 mx-4">
            {isSearchPage && (
              <button
                onClick={handleFilterToggle}
                type="button"
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border border-blue-light-200 bg-white px-4 py-3 text-sm font-medium text-gray-dark-600 shadow-sm transition-all hover:border-blue-light-300 hover:shadow-md"
                aria-label="Abrir filtros avanzados"
              >
                <Settings className="w-5 h-5 text-blue-light-600" />
                Filtros
              </button>
            )}

            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4 text-blue-light-600" />

              <span className="text-sm font-medium text-gray-dark-600">
                Buscar
              </span>
            </button>
          </div>

          {/* Right Side */}

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications Button */}

            <div className="relative" ref={notificationsContainerRef}>
              <button
                onClick={handleNotificationsClick}
                className={`relative p-3 rounded-full border bg-white shadow-sm transition-all ${
                  isNotificationsOpen
                    ? "border-blue-vivid-500 shadow-md"
                    : "border-blue-light-200 hover:border-blue-light-300 hover:shadow-md"
                }`}
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-gray-dark-600" />

                {hasNewNotifications && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px] shadow-white" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-blue-light-150 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-blue-light-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-dark-800">
                        Notificaciones
                      </p>

                      <p className="text-xs text-gray-dark-500">
                        {newNotificationCount > 0
                          ? `${newNotificationCount} nuevas para revisar`
                          : "No hay novedades pendientes"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);

                        if (isAuthenticated) {
                          router.push("/account/notifications");
                        }
                      }}
                      className="text-xs font-semibold text-blue-vivid-600 hover:text-blue-vivid-500"
                    >
                      Ver todo
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto px-2 py-3">
                    {!isAuthenticated ? (
                      <p className="px-3 py-6 text-center text-sm text-gray-dark-500">
                        Inicia sesión para consultar tus notificaciones.
                      </p>
                    ) : isFetchingNotifications ? (
                      <div className="flex items-center justify-center py-6 text-blue-light-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-gray-dark-500">
                        No tienes notificaciones nuevas en este momento.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {recentNotifications.map((notification) => (
                          <li
                            key={`${notification.bookingId}-${notification.role}`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationNavigate(notification)
                              }
                              className="w-full rounded-2xl border border-blue-light-100 bg-blue-light-50 px-3 py-3 text-left transition hover:border-blue-light-200 hover:bg-blue-light-100"
                            >
                              <div className="mb-1 flex items-center justify-between text-xs text-gray-dark-500">
                                <span className="font-semibold text-gray-dark-700">
                                  #{notification.bookingId}
                                </span>

                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-light-600">
                                  {notification.role === "host"
                                    ? "Anfitrión"
                                    : "Huésped"}
                                </span>
                              </div>

                              <p className="text-sm font-semibold text-gray-dark-900 line-clamp-2">
                                {notification.propertyTitle}
                              </p>

                              <p className="mt-1 text-xs text-gray-dark-500">
                                Estado:{" "}
                                {statusLabels[notification.status] ??
                                  notification.status}
                              </p>

                              {notification.reminderType === "CHECKIN_24H" && (
                                <p className="mt-1 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                                  Recordatorio de check-in
                                </p>
                              )}

                              <p className="mt-2 text-xs text-gray-dark-400">
                                {formatNotificationDate(
                                  notification.eventAt ?? notification.createdAt
                                )}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Button with Dropdown */}

            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-full border border-blue-light-200 hover:border-blue-light-300 bg-white shadow-sm hover:shadow-md transition-all"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-gray-dark-600" />

                {isAuthenticated && user?.image ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-2 ring-blue-light-200">
                    <Image
                      src={user.image}
                      alt={user.name || "Avatar del usuario"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-light-400 to-blue-light-500 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {isAuthenticated && user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                )}
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
            {/* Donde */}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide">
                  Donde
                </label>
                {selectedLocation && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-xs text-blue-light-600 hover:text-blue-light-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-light-500 flex-shrink-0" />

                <select
                  value={selectedLocation?.id ?? ""}
                  onChange={(event) => {
                    const option = LOCATION_OPTIONS.find(
                      (item) => item.id === event.target.value
                    );

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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-gray-dark-400 uppercase tracking-wide">
                  Fechas
                </label>
                {(checkInDate || checkOutDate) && (
                  <button
                    type="button"
                    onClick={clearDates}
                    className="text-xs text-blue-light-600 hover:text-blue-light-700 font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-light-500 flex-shrink-0" />

                  <input
                    type="date"
                    value={checkInDate ?? ""}
                    onChange={(event) =>
                      setCheckInDate(event.target.value || undefined)
                    }
                    className="flex-1 rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-sm font-medium text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-light-500 flex-shrink-0" />

                  <input
                    type="date"
                    value={checkOutDate ?? ""}
                    onChange={(event) =>
                      setCheckOutDate(event.target.value || undefined)
                    }
                    className="flex-1 rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-sm font-medium text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>
              </div>
            </div>

            {/* Quien */}

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-dark-400">
                  Quien
                </p>
                {totalGuests > 0 && (
                  <button
                    type="button"
                    onClick={clearGuests}
                    className="text-xs text-blue-light-600 hover:text-blue-light-700 font-medium"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {GUEST_FIELDS.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-blue-light-150 bg-blue-light-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-dark-700">
                        {label}
                      </p>

                      <p className="text-xs text-gray-dark-500">
                        {description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustGuestCount(key, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300 disabled:cursor-not-allowed disabled:border-blue-light-100 disabled:text-blue-light-200"
                        aria-label={`Disminuir ${label}`}
                        disabled={guestCounts[key] === 0}
                      >
                        -
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
