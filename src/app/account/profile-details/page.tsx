"use client";

import React from "react";

import { useAuth } from "@/src/hooks/useAuth";
import { useProfileDetails } from "@/src/hooks/useProfileDetails";
import { PreferencesCard } from "@/src/components/profile/PreferencesCard";

import { AlertCircle, User } from "lucide-react";

export default function ProfileDetailsPage() {
  const { isAuthenticated } = useAuth();

  const { profileData, preferences, loading, message } = useProfileDetails();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />

          <p className="text-gray-600">
            Debes iniciar sesión para ver esta página
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-4 h-6 w-48 rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-64 rounded bg-gray-200"></div>
          <div className="h-4 w-32 rounded bg-gray-200"></div>
        </div>

        <PreferencesCard preferences={[]} loading={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de error si existe */}

      {message && message.type === "error" && (
        <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="mb-1 text-sm font-semibold text-red-900">Error</h3>

              <p className="text-sm text-red-800">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Informacion basica del perfil */}

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Información del perfil
            </h2>

            <p className="text-sm text-gray-600">
              Datos obtenidos del stored procedure
            </p>
          </div>
        </div>

        {profileData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <span className="min-w-[120px] font-medium text-gray-700">
                Nombre:
              </span>

              <span className="text-gray-900">
                {profileData.firstName && profileData.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData.firstName || "No especificado"}
              </span>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-gray-50 p-4">
              <span className="min-w-[120px] font-medium text-gray-700">
                Bio:
              </span>

              <span className="text-gray-900">
                {profileData.bio || "Sin biografia"}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </div>

            <p className="text-gray-500">No se encontraron datos del perfil</p>
          </div>
        )}
      </div>

      {/* Tarjeta de preferencias */}

      <PreferencesCard preferences={preferences} loading={loading} />
    </div>
  );
}
