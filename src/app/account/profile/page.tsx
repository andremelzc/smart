"use client";

import React, { useState, useEffect, startTransition } from "react";

import Image from "next/image";

import {
  User,
  Briefcase,
  Home as HomeIcon,
  Clock,
  PawPrint,
  Globe,
  Check,
  X,
  Edit3,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/src/hooks/useAuth";
import { useProfileDetails } from "@/src/hooks/useProfileDetails";
import { formatFullName } from "@/src/lib/formatters";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const {
    profileData: spProfileData,
    preferences,
    loading,
    message,
    updateProfileDetails,
  } = useProfileDetails();

  const [isEditing, setIsEditing] = useState(false);

  // Estado para las preferencias editables

  const [editablePreferences, setEditablePreferences] = useState<{
    [key: number]: string;
  }>({});

  const [editableBio, setEditableBio] = useState("");

  // Datos del perfil publico estatico (fallback)

  const profileData = {
    bio: "Me encanta viajar y conocer nuevas culturas. Soy una persona responsable y respetuosa que siempre cuida los espacios donde se hospeda.",
  };

  // Inicializar valores editables cuando cambien las preferencias

  useEffect(() => {
    if (preferences.length > 0) {
      const prefValues: { [key: number]: string } = {};

      preferences.forEach((pref) => {
        prefValues[pref.preferenceId] = pref.valueText || "";
      });

      // Use startTransition to avoid cascading renders

      startTransition(() => {
        setEditablePreferences(prefValues);
      });
    }
  }, [preferences]);

  // Separate effect for bio to avoid cascading renders

  useEffect(() => {
    const bio = spProfileData?.bio || profileData.bio || "";

    // Use startTransition to avoid cascading renders

    startTransition(() => {
      setEditableBio(bio);
    });
  }, [spProfileData?.bio, profileData.bio]);

  const handleEdit = () => {
    setIsEditing(true);

    // Los valores ya estan sincronizados en el useEffect
  };

  const handleSave = async () => {
    try {
      // Convertir las preferencias editables al formato esperado por la API

      const preferencesToUpdate = preferences.map((pref) => ({
        code: pref.code,

        value: editablePreferences[pref.preferenceId] || "",
      }));

      console.log("Saving changes:", {
        bio: editableBio,

        preferences: preferencesToUpdate,
      });

      // Llamar al hook para actualizar

      const success = await updateProfileDetails(
        editableBio,
        preferencesToUpdate
      );

      if (success) {
        setIsEditing(false);
      }

      // Si hay error, el mensaje se muestra automaticamente via el hook
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales

    if (preferences.length > 0) {
      const prefValues: { [key: number]: string } = {};

      preferences.forEach((pref) => {
        prefValues[pref.preferenceId] = pref.valueText || "";
      });

      setEditablePreferences(prefValues);
    }

    setEditableBio(spProfileData?.bio || profileData.bio || "");

    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <div className="bg-blue-light-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <User className="text-blue-light-500 h-8 w-8" />
        </div>

        <p className="text-gray-dark-600 text-lg">
          Debes iniciar sesion para ver tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-gray-dark-900 mb-2 text-3xl font-semibold">
          Mi perfil público
        </h1>

        <p className="text-gray-dark-600">
          Esta es la información que otros usuarios ven cuando visitan tu
          perfil. Ayuda a generar confianza y conectar con la comunidad.
        </p>
      </div>

      {/* Main Profile Section */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-gray-dark-900 text-xl font-semibold">
            Acerca de mí
          </h2>

          {!isEditing && (
            <button
              onClick={handleEdit}
              className="border-gray-dark-300 flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-colors hover:bg-gray-50"
            >
              <Edit3 className="h-4 w-4" />
              Editar perfil
            </button>
          )}
        </div>

        <div className="p-6">
          {isEditing ? (
            // Editing Mode

            <div className="space-y-6">
              {/* Bio */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-gray-dark-700 block text-sm font-medium">
                    Biografía
                  </label>
                  <span
                    className={`text-xs ${
                      editableBio.length > 500
                        ? "font-semibold text-red-600"
                        : "text-gray-medium-500"
                    }`}
                  >
                    {editableBio.length}/500
                  </span>
                </div>

                <textarea
                  value={editableBio}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setEditableBio(e.target.value);
                    }
                  }}
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Cuentanos algo sobre ti..."
                />
              </div>

              {/* Preferencias dinamicas */}

              <div className="grid gap-6 md:grid-cols-2">
                {preferences?.map((preference) => {
                  const currentValue =
                    editablePreferences[preference.preferenceId] || "";
                  const maxLength = 100;

                  return (
                    <div key={preference.preferenceId}>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-gray-dark-700 block text-sm font-medium">
                          {preference.name}
                        </label>
                        <span
                          className={`text-xs ${
                            currentValue.length > maxLength
                              ? "font-semibold text-red-600"
                              : "text-gray-medium-500"
                          }`}
                        >
                          {currentValue.length}/{maxLength}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => {
                          if (e.target.value.length <= maxLength) {
                            setEditablePreferences((prev) => ({
                              ...prev,
                              [preference.preferenceId]: e.target.value,
                            }));
                          }
                        }}
                        maxLength={maxLength}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder={preference.description}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-light-500 hover:bg-blue-light-600 focus:ring-blue-light-500 inline-flex items-center rounded border border-transparent px-3 py-1.5 text-xs font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="mr-1 h-3 w-3 animate-spin rounded-full border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Guardar
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-gray-medium-200 text-gray-dark-500 hover:bg-gray-medium-50 focus:ring-blue-light-500 inline-flex items-center rounded border bg-white px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="mr-1 h-3 w-3" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            // Display Mode

            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Avatar Card */}

              <div className="flex-shrink-0 lg:w-80">
                <div className="text-center">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={spProfileData?.firstName || user?.name || "Usuario"}
                      width={128}
                      height={128}
                      className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-gray-100 object-cover"
                    />
                  ) : (
                    <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gray-900">
                      <span className="text-5xl font-bold text-white">
                        {(spProfileData?.firstName || user?.name || "U").charAt(
                          0
                        )}
                      </span>
                    </div>
                  )}

                  <h3 className="text-gray-dark-900 mb-1 text-2xl font-bold">
                    {spProfileData?.firstName
                      ? formatFullName(
                          spProfileData.firstName,
                          spProfileData.lastName
                        )
                      : user?.name || "Usuario"}
                  </h3>

                  <p className="text-gray-dark-500 mb-4">Huésped</p>

                  {/* Stats */}

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-gray-dark-900 text-2xl font-bold">8</p>

                      <p className="text-gray-dark-500 text-sm">Viajes</p>
                    </div>

                    <div>
                      <p className="text-gray-dark-900 text-2xl font-bold">
                        4.9
                      </p>

                      <p className="text-gray-dark-500 text-sm">Calificación</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info List */}

              <div className="flex-1 space-y-6">
                {/* Bio - usar datos del SP cuando esten disponibles */}

                {(spProfileData?.bio || profileData.bio) && (
                  <div className="flex items-start gap-4">
                    <MessageSquare className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />

                    <div>
                      <p className="text-gray-dark-900 leading-relaxed">
                        {spProfileData?.bio || profileData.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Renderizar preferencias dinamicamente desde el SP */}

                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 animate-pulse rounded bg-gray-300"></div>

                    <div className="h-4 w-48 animate-pulse rounded bg-gray-300"></div>
                  </div>
                ) : (
                  preferences?.map((preference) => {
                    // Solo mostrar preferencias que tienen valores

                    if (!preference.valueText) return null;

                    // Mapear iconos segun el codigo de preferencia

                    const getIcon = (code: string) => {
                      switch (code) {
                        case "WORK":
                          return (
                            <Briefcase className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        case "LOCATION":
                          return (
                            <HomeIcon className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        case "INTERESTS":
                          return (
                            <Clock className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        case "PETS":
                          return (
                            <PawPrint className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        case "LANGUAGE":
                          return (
                            <Globe className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        case "SCHOOL":
                          return (
                            <User className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );

                        default:
                          return (
                            <AlertCircle className="text-gray-dark-700 mt-0.5 h-6 w-6 flex-shrink-0" />
                          );
                      }
                    };

                    return (
                      <div
                        key={preference.preferenceId}
                        className="flex items-start gap-4"
                      >
                        {getIcon(preference.code)}

                        <div>
                          <p className="text-gray-dark-900 font-medium">
                            {preference.name}: {preference.valueText}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <User className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

          <div>
            <h4 className="mb-1 font-medium text-blue-900">
              Tu perfil público
            </h4>

            <p className="text-sm text-blue-800">
              Esta información es visible para otros usuarios de la plataforma.
              Ayuda a generar confianza y conectar con anfitriones y otros
              huéspedes.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes del sistema */}

      {message && (
        <div
          className={`rounded-lg border-l-4 p-4 shadow-sm ${
            message.type === "error"
              ? "border-red-400 bg-red-50"
              : "border-green-400 bg-green-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            />

            <div>
              <h3
                className={`mb-1 text-sm font-semibold ${
                  message.type === "error" ? "text-red-900" : "text-green-900"
                }`}
              >
                {message.type === "error" ? "Error" : "Exito"}
              </h3>

              <p
                className={`text-sm ${
                  message.type === "error" ? "text-red-800" : "text-green-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
