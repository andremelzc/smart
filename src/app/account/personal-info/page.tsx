"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { useProfile } from "@/src/hooks/useProfile";
import { useProfileEditing } from "@/src/hooks/useProfileEditing";
import { ProfileCard, ProfileField, ProfileSkeleton } from "@/src/components/profile";
import { AlertCircle } from "lucide-react";

export default function PersonalInfoPage() {
  const { isAuthenticated } = useAuth();
  const { profileData, loading, message, updateProfile, setMessage } = useProfile();

  const {
    editingField,
    tempData,
    tempFirstName,
    tempLastName,
    saving,
    handleEdit,
    handleSave,
    handleCancel,
    setTempData,
    setTempFirstName,
    setTempLastName
  } = useProfileEditing({
    profileData,
    onUpdate: updateProfile,
    onMessage: setMessage
  });

  // Mostrar loading mientras no esté autenticado o cargando datos
  if (!isAuthenticated || loading) {
    return <ProfileSkeleton />;
  }

  // Verificar campos requeridos
  const missingFields = [];
  if (!profileData.firstName || !profileData.lastName) missingFields.push("Nombre completo");
  if (!profileData.email) missingFields.push("Correo electrónico");
  if (!profileData.phone) missingFields.push("Número de teléfono");
  if (!profileData.dni) missingFields.push("DNI");
  if (!profileData.birthDate) missingFields.push("Fecha de nacimiento");

  const isProfileComplete = missingFields.length === 0;

  // Función helper para crear las props de cada campo
  const getFieldProps = (fieldKey: string, type: 'text' | 'email' | 'tel' | 'date' = 'text') => ({
    fieldKey,
    type,
    isEditing: editingField === fieldKey,
    isSaving: saving,
    onEdit: () => handleEdit(fieldKey as any),
    onSave: handleSave,
    onCancel: handleCancel,
    onTempValueChange: (value: string) => setTempData({ [fieldKey]: value }),
    tempValue: tempData[fieldKey] || '',
  });

  return (
    <>
      {/* Banner de advertencia */}
      {!isProfileComplete && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                Completa tu información personal para reservar
              </h3>
              <p className="text-sm text-amber-800 mb-2">
                Para poder realizar reservas de recintos, necesitas completar todos los campos de tu perfil. 
                Esto nos ayuda a brindarte un mejor servicio y garantizar la seguridad de todos los usuarios.
              </p>
              <div className="text-sm text-amber-900">
                <span className="font-medium">Campos faltantes:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProfileCard message={message}>
        {/* Nombre completo */}
        <ProfileField
          label="Nombre completo"
          value={profileData.firstName && profileData.lastName 
            ? `${profileData.firstName}|${profileData.lastName}` 
            : profileData.firstName || null
          }
          {...getFieldProps('name')}
          tempFirstName={tempFirstName}
          tempLastName={tempLastName}
          onTempFirstNameChange={setTempFirstName}
          onTempLastNameChange={setTempLastName}
        />

        {/* Email */}
        <ProfileField
          label="Correo electrónico"
          value={profileData.email}
          placeholder="ejemplo@correo.com"
          {...getFieldProps('email', 'email')}
        />

        {/* Teléfono */}
        <ProfileField
          label="Número de teléfono"
          value={profileData.phone}
          placeholder="999 999 999"
          {...getFieldProps('phone', 'tel')}
        />

        {/* DNI */}
        <ProfileField
          label="Documento de identidad (DNI)"
          value={profileData.dni}
          placeholder="12345678"
          {...getFieldProps('dni')}
        />

        {/* Fecha de nacimiento */}
        <ProfileField
          label="Fecha de nacimiento"
          value={profileData.birthDate}
          {...getFieldProps('birthdate', 'date')}
        />
      </ProfileCard>
    </>
  );
}