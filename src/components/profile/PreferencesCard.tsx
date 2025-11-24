"use client";

import React from "react";

import { UserPreference } from "@/src/services/user.service";

import { Settings, Check, X } from "lucide-react";

interface PreferencesCardProps {
  preferences: UserPreference[];

  loading?: boolean;
}

export function PreferencesCard({
  preferences,
  loading,
}: PreferencesCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-blue-100">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200"></div>

            <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-gray-100"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Preferencias del usuario
          </h2>

          <p className="text-sm text-gray-600">
            Configuracion y preferencias personales
          </p>
        </div>
      </div>

      {preferences.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Settings className="h-8 w-8 text-gray-400" />
          </div>

          <p className="text-sm text-gray-500">
            No hay preferencias configuradas aun
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {preferences.map((preference) => (
            <div
              key={preference.preferenceId}
              className="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    {preference.name}
                  </h3>

                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {preference.code}
                  </span>
                </div>

                {preference.description && (
                  <p className="mb-2 text-sm text-gray-600">
                    {preference.description}
                  </p>
                )}

                {preference.valueText && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Valor:
                    </span>

                    <span className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm">
                      {preference.valueText}
                    </span>
                  </div>
                )}
              </div>

              <div className="ml-4">
                {preference.valueText ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <X className="h-4 w-4 text-gray-400" />
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
