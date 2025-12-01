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
    adults: 1,
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
      adults: 1,
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
    <nav className="border-blue-light-100 to-blue-light-50/90 sticky top-0 z-50 w-full border-b bg-gradient-to-b from-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}

        <div className="flex items-center justify-between py-5 lg:py-6">
          {/* Logo */}

          <Link
            href="/"
            className="group flex flex-shrink-0 items-center gap-3"
          >
            <div className="from-blue-light-500 to-blue-light-600 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>

            <h1 className="text-blue-light-700 hidden text-2xl font-bold sm:block">
              smart
            </h1>
          </Link>

          {/* Search Bar - Desktop */}

          <div className="mx-10 hidden max-w-3xl flex-1 items-center gap-4 lg:flex">
            <div ref={searchBarRef} className="relative flex-1">
              <div
                className={`relative flex w-full items-center rounded-full border transition-all duration-300 ${
                  activeSearchPanel
                    ? "border-transparent bg-gray-100"
                    : "border-blue-light-200 hover:border-blue-light-300 bg-white hover:shadow-md"
                }`}
              >
                {/* Donde */}

                <div
                  className={`relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full px-6 py-3.5 transition-all duration-300 ${
                    activeSearchPanel === "location"
                      ? "z-10 bg-white shadow-lg ring-1 ring-black/5"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSearchPanel("location")}
                >
                  <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />

                  <div className="min-w-0 flex-1 text-left">
                    <span className="text-xs font-bold tracking-wider text-gray-800 uppercase">
                      Dónde
                    </span>
                    <span
                      className={`block truncate text-sm font-medium ${
                        selectedLocation ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {selectedLocation?.title || "Explora destinos"}
                    </span>
                  </div>

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

                {/* Separator 1 */}
                <div
                  className={`h-8 w-px self-center bg-gray-300 transition-opacity duration-200 ${
                    activeSearchPanel
                      ? "opacity-0"
                      : "opacity-100 group-hover:opacity-0"
                  }`}
                ></div>

                {/* Fechas */}

                <div
                  className={`relative flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full px-6 py-3.5 transition-all duration-300 ${
                    activeSearchPanel === "dates"
                      ? "z-10 bg-white shadow-lg ring-1 ring-black/5"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSearchPanel("dates")}
                >
                  <Calendar className="h-5 w-5 flex-shrink-0 text-gray-500" />

                  <div className="min-w-0 flex-1 text-left">
                    <span className="text-xs font-bold tracking-wider text-gray-800 uppercase">
                      Cuándo
                    </span>
                    <span
                      className={`block truncate text-sm font-medium ${
                        checkInDate && checkOutDate
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {checkInDate && checkOutDate
                        ? `${formatDate(checkInDate)} - ${formatDate(
                            checkOutDate
                          )}`
                        : "Cualquier fecha"}
                    </span>
                  </div>
                </div>

                {/* Separator 2 */}
                <div
                  className={`h-8 w-px self-center bg-gray-300 transition-opacity duration-200 ${
                    activeSearchPanel
                      ? "opacity-0"
                      : "opacity-100 group-hover:opacity-0"
                  }`}
                ></div>

                {/* Quien + Search Button */}

                <div
                  className={`relative flex flex-[1.3] items-center gap-2 rounded-full py-2 pr-2 pl-6 transition-all duration-300 ${
                    activeSearchPanel === "guests"
                      ? "z-10 bg-white shadow-lg ring-1 ring-black/5"
                      : "cursor-pointer hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (activeSearchPanel !== "guests") {
                      toggleSearchPanel("guests");
                    }
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Users className="h-5 w-5 flex-shrink-0 text-gray-500" />

                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-xs font-bold tracking-wider text-gray-800 uppercase">
                        Quién
                      </span>
                      <span
                        className={`block truncate text-sm font-medium ${
                          totalGuests > 0 ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {totalGuests > 0 ? getGuestSummary() : "¿Cuántos?"}
                      </span>
                    </div>
                  </div>

                  {activeSearchPanel === "guests" && (
                    <GuestPopover
                      counts={guestCounts}
                      onChange={(next) => setGuestCounts(next)}
                      onClear={clearGuests}
                    />
                  )}

                  {/* Search Button */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch();
                    }}
                    className={`from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 ml-2 flex items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md transition-all duration-300 hover:shadow-lg ${
                      activeSearchPanel ? "h-12 w-auto gap-2 px-6" : "h-12 w-12"
                    }`}
                    aria-label="Buscar"
                  >
                    <Search className="h-5 w-5 stroke-[2.5px]" />
                    <span
                      className={`overflow-hidden font-bold whitespace-nowrap transition-all duration-300 ${
                        activeSearchPanel
                          ? "max-w-[100px] opacity-100"
                          : "max-w-0 opacity-0"
                      }`}
                    >
                      Buscar
                    </span>
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
                className="border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
                aria-label="Abrir filtros avanzados"
              >
                <Settings className="text-blue-light-500 h-5 w-5" />
                Filtros
              </button>
            )}
          </div>

          {/* Search Button - Mobile */}

          <div className="mx-4 flex items-center gap-2 lg:hidden">
            {isSearchPage && (
              <button
                onClick={handleFilterToggle}
                type="button"
                className="border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300 inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md"
                aria-label="Abrir filtros avanzados"
              >
                <Settings className="text-blue-light-600 h-5 w-5" />
                Filtros
              </button>
            )}

            <button
              onClick={handleSearch}
              className="border-blue-light-200 hover:border-blue-light-300 flex flex-1 items-center justify-center gap-2 rounded-full border bg-white px-5 py-3 shadow-sm transition-all hover:shadow-md"
              aria-label="Buscar"
            >
              <Search className="text-blue-light-600 h-4 w-4" />

              <span className="text-gray-dark-600 text-sm font-medium">
                Buscar
              </span>
            </button>
          </div>

          {/* Right Side */}

          <div className="flex flex-shrink-0 items-center gap-3">
            {/* Notifications Button */}

            <div className="relative" ref={notificationsContainerRef}>
              <button
                onClick={handleNotificationsClick}
                className={`relative rounded-full border bg-white p-3 shadow-sm transition-all ${
                  isNotificationsOpen
                    ? "border-blue-vivid-500 shadow-md"
                    : "border-blue-light-200 hover:border-blue-light-300 hover:shadow-md"
                }`}
                aria-label="Notificaciones"
              >
                <Bell className="text-gray-dark-600 h-5 w-5" />

                {hasNewNotifications && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px] shadow-white" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="border-blue-light-150 absolute right-0 z-50 mt-3 w-80 rounded-3xl border bg-white shadow-xl">
                  <div className="border-blue-light-100 flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-gray-dark-800 text-sm font-semibold">
                        Notificaciones
                      </p>

                      <p className="text-gray-dark-500 text-xs">
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
                      className="text-blue-vivid-600 hover:text-blue-vivid-500 text-xs font-semibold"
                    >
                      Ver todo
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto px-2 py-3">
                    {!isAuthenticated ? (
                      <p className="text-gray-dark-500 px-3 py-6 text-center text-sm">
                        Inicia sesión para consultar tus notificaciones.
                      </p>
                    ) : isFetchingNotifications ? (
                      <div className="text-blue-light-500 flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <p className="text-gray-dark-500 px-3 py-6 text-center text-sm">
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
                              className="border-blue-light-100 bg-blue-light-50 hover:border-blue-light-200 hover:bg-blue-light-100 w-full rounded-2xl border px-3 py-3 text-left transition"
                            >
                              <div className="text-gray-dark-500 mb-1 flex items-center justify-between text-xs">
                                <span className="text-gray-dark-700 font-semibold">
                                  #{notification.bookingId}
                                </span>

                                <span className="text-blue-light-600 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                                  {notification.role === "host"
                                    ? "Anfitrión"
                                    : "Huésped"}
                                </span>
                              </div>

                              <p className="text-gray-dark-900 line-clamp-2 text-sm font-semibold">
                                {notification.propertyTitle}
                              </p>

                              <p className="text-gray-dark-500 mt-1 text-xs">
                                Estado:{" "}
                                {statusLabels[notification.status] ??
                                  notification.status}
                              </p>

                              {notification.reminderType === "CHECKIN_24H" && (
                                <p className="mt-1 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-rose-600 uppercase">
                                  Recordatorio de check-in
                                </p>
                              )}

                              <p className="text-gray-dark-400 mt-2 text-xs">
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
                className="border-blue-light-200 hover:border-blue-light-300 flex items-center gap-3 rounded-full border bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md"
                aria-label="Menu"
              >
                <Menu className="text-gray-dark-600 h-5 w-5" />

                {isAuthenticated && user?.image ? (
                  <div className="ring-blue-light-200 h-9 w-9 overflow-hidden rounded-full shadow-sm ring-2">
                    <Image
                      src={user.image}
                      alt={user.name || "Avatar del usuario"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="from-blue-light-400 to-blue-light-500 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br shadow-sm">
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

        <div className="pb-5 lg:hidden">
          <div className="border-blue-light-200 flex flex-col gap-5 rounded-2xl border bg-white p-5 shadow-sm">
            {/* Donde */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-gray-dark-400 block text-[11px] font-bold tracking-wide uppercase">
                  Donde
                </label>
                {selectedLocation && (
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-blue-light-500 h-5 w-5 flex-shrink-0" />

                <select
                  value={selectedLocation?.id ?? ""}
                  onChange={(event) => {
                    const option = LOCATION_OPTIONS.find(
                      (item) => item.id === event.target.value
                    );

                    setSelectedLocation(option ?? null);
                  }}
                  className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 flex-1 rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2"
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
              <div className="mb-2 flex items-center justify-between">
                <label className="text-gray-dark-400 block text-[11px] font-bold tracking-wide uppercase">
                  Fechas
                </label>
                {(checkInDate || checkOutDate) && (
                  <button
                    type="button"
                    onClick={clearDates}
                    className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-light-500 h-5 w-5 flex-shrink-0" />

                  <input
                    type="date"
                    value={checkInDate ?? ""}
                    onChange={(event) =>
                      setCheckInDate(event.target.value || undefined)
                    }
                    className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 flex-1 rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-light-500 h-5 w-5 flex-shrink-0" />

                  <input
                    type="date"
                    value={checkOutDate ?? ""}
                    onChange={(event) =>
                      setCheckOutDate(event.target.value || undefined)
                    }
                    className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 flex-1 rounded-xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>

            {/* Quien */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-gray-dark-400 text-[11px] font-bold tracking-wide uppercase">
                  Quien
                </p>
                {totalGuests > 0 && (
                  <button
                    type="button"
                    onClick={clearGuests}
                    className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {GUEST_FIELDS.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="border-blue-light-150 bg-blue-light-50 flex items-center justify-between rounded-xl border px-4 py-3"
                  >
                    <div>
                      <p className="text-gray-dark-700 text-sm font-semibold">
                        {label}
                      </p>

                      <p className="text-gray-dark-500 text-xs">
                        {description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => adjustGuestCount(key, -1)}
                        className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 disabled:border-blue-light-100 disabled:text-blue-light-200 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
                        aria-label={`Disminuir ${label}`}
                        disabled={guestCounts[key] === 0}
                      >
                        -
                      </button>

                      <span className="text-gray-dark-700 w-6 text-center text-sm font-semibold">
                        {guestCounts[key]}
                      </span>

                      <button
                        type="button"
                        onClick={() => adjustGuestCount(key, 1)}
                        className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
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
              className="from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br py-4 font-semibold text-white shadow-md transition-all hover:shadow-lg"
            >
              <Search className="h-5 w-5" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
