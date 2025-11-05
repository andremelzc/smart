"use client";

import React from "react";
import { UserPreference } from "@/src/services/user.service";
import { Settings, Check, X } from "lucide-react";

interface PreferencesCardProps {
  preferences: UserPreference[];
  loading?: boolean;
}

export function PreferencesCard({ preferences, loading }: PreferencesCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center animate-pulse">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Preferencias del usuario
          </h2>
          <p className="text-sm text-gray-600">
            Configuración y preferencias personales
          </p>
        </div>
      </div>

      {preferences.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            No hay preferencias configuradas aún
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {preferences.map((preference) => (
            <div 
              key={preference.preferenceId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">
                    {preference.name}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {preference.code}
                  </span>
                </div>
                
                {preference.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {preference.description}
                  </p>
                )}
                
                {preference.valueText && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Valor:
                    </span>
                    <span className="text-sm bg-white px-3 py-1 rounded-lg border border-gray-200">
                      {preference.valueText}
                    </span>
                  </div>
                )}
              </div>

              <div className="ml-4">
                {preference.valueText ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}