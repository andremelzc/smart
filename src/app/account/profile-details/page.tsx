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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Debes iniciar sesión para ver esta página</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <PreferencesCard preferences={[]} loading={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de error si existe */}
      {message && message.type === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-800">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información básica del perfil */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
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
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700 min-w-[120px]">Nombre:</span>
              <span className="text-gray-900">
                {profileData.firstName && profileData.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData.firstName || "No especificado"
                }
              </span>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700 min-w-[120px]">Bio:</span>
              <span className="text-gray-900">
                {profileData.bio || "Sin biografía"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
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