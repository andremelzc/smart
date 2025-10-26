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
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link
              href="/host"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  smart
                </h1>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  HOST
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuToggle}
                className="flex items-center gap-3 px-3 py-2 rounded-full border border-gray-300 hover:border-gray-400 bg-white shadow-sm hover:shadow-md transition-all"
                aria-label="Menú"
              >
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
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