"use client";

import React, { useState, useRef, useEffect } from "react";

import Link from "next/link";

import { Menu, Home } from "lucide-react";

import { useAuth } from "@/src/hooks/useAuth";

import UserMenu from "@/src/components/layout/UserMenu";

import { authService } from "@/src/services/auth.service";

export default function HostNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuth();

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
    <nav className="bg-blue-light-50 border-blue-light-100 sticky top-0 z-50 w-full border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          {/* Left Side - Logo */}

          <div className="flex items-center">
            <Link
              href="/host"
              className="group flex flex-shrink-0 items-center gap-3"
            >
              <div className="from-blue-light-500 to-blue-light-600 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg">
                <Home className="h-6 w-6 text-white" />
              </div>

              <div className="flex items-center gap-2.5">
                <h1 className="text-blue-light-700 hidden text-2xl font-bold sm:block">
                  smart
                </h1>

                <span className="text-blue-vivid-600 bg-blue-vivid-50 border-blue-vivid-200 rounded-full border px-2.5 py-1 text-xs font-bold">
                  HOST
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side - User Menu */}

          <div className="flex flex-shrink-0 items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="border-blue-light-200 hover:border-blue-light-300 flex items-center gap-3 rounded-full border bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md"
                aria-label="Menu"
              >
                <Menu className="text-gray-dark-600 h-5 w-5" />

                <div className="from-blue-light-400 to-blue-light-500 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br shadow-sm">
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
