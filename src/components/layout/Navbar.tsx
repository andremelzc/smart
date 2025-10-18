"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, Home } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function Navbar() {
  const [origin, setOrigin] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("");

  const handleSearch = () => {
    console.log({ origin, departureDate, returnDate, passengers });
  };

  return (
    <div className="w-full bg-blue-light-100">
      {/* Navbar Container */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Home className="w-8 h-8 text-blue-light-600" />
            <h1 className="text-xl font-bold text-gray-dark-700">smart</h1>
          </Link>

          {/* Search Bar - Inline */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center rounded-full overflow-hidden shadow-md bg-white">
              {/* Dónde */}
              <div className="flex-1 px-6 py-3 border-r border-gray-200">
                <label className="block text-xs font-semibold mb-0.5 text-gray-dark-700">
                  Dónde
                </label>
                <input
                  type="text"
                  placeholder="Explora destinos"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full text-sm text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Fechas */}
              <div className="flex-1 px-6 py-3 border-r border-gray-200">
                <label className="block text-xs font-semibold mb-0.5 text-gray-dark-700">
                  Fechas
                </label>
                <input
                  type="text"
                  placeholder="Agrega fechas"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !e.target.value && (e.target.type = "text")}
                  className="w-full text-sm text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Quién + Search Button */}
              <div className="flex-1 px-6 py-3 flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-0.5 text-gray-dark-700">
                    Quién
                  </label>
                  <input
                    type="text"
                    placeholder="¿Cuántos?"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full text-sm text-gray-dark-700 outline-none bg-transparent placeholder:text-gray-400"
                  />
                </div>

                {/* Search Button */}
                <Button
                  variant="primary"
                  size="md"
                  iconOnly
                  leftIcon={Search}
                  onClick={handleSearch}
                  aria-label="Buscar"
                />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Host Link - Text Button */}
            <Button variant="text" size="md" className="hidden xl:block text-gray-dark-500 font-semibold">
              Conviértete en anfitrión
            </Button>

            {/* Menu Button */}
            <Button
              variant="primary"
              size="md"
              iconOnly
              leftIcon={Menu}
              aria-label="Menú"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
