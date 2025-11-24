import React from "react";

import { Check, X, Pencil } from "lucide-react";

import { formatDateForDisplay } from "@/src/utils/dateUtils";

interface ProfileFieldProps {
  label: string;
  value: string | null;
  fieldKey: string;
  type?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  isEditing: boolean;
  isSaving: boolean;
  tempValue?: string;
  tempFirstName?: string;
  tempLastName?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTempValueChange: (value: string) => void;
  onTempFirstNameChange?: (value: string) => void;
  onTempLastNameChange?: (value: string) => void;
  validator?: (value: string) => string | null;
}

export function ProfileField({
  label,
  value,
  fieldKey,
  type = "text",
  placeholder,
  isEditing,
  isSaving,
  tempValue = "",
  tempFirstName = "",
  tempLastName = "",
  onEdit,
  onSave,
  onCancel,
  onTempValueChange,
  onTempFirstNameChange,
  onTempLastNameChange,
}: ProfileFieldProps) {
  const renderDisplayValue = () => {
    if (fieldKey === "name") {
      const firstName = value?.split("|")[0] || "";

      const lastName = value?.split("|")[1] || "";

      return firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : "No proporcionado";
    }

    if (fieldKey === "birthdate") {
      return formatDateForDisplay(value);
    }

    return value || "No proporcionado";
  };

  const renderEditingInput = () => {
    if (fieldKey === "name") {
      return (
        <div className="space-y-3">
          <div>
            <label className="text-gray-medium-500 mb-1 block text-xs font-medium">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              value={tempFirstName}
              onChange={(e) => onTempFirstNameChange?.(e.target.value)}
              className="border-gray-medium-200 focus:ring-blue-light-500 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-gray-medium-500 mb-1 block text-xs font-medium">
              Apellido
            </label>
            <input
              type="text"
              placeholder="Ingresa tu apellido"
              value={tempLastName}
              onChange={(e) => onTempLastNameChange?.(e.target.value)}
              className="border-gray-medium-200 focus:ring-blue-light-500 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              disabled={isSaving}
            />
          </div>
        </div>
      );
    }

    const inputValue = tempValue;

    return (
      <input
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => onTempValueChange(e.target.value)}
        className="border-gray-medium-200 focus:ring-blue-light-500 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
        disabled={isSaving}
      />
    );
  };

  return (
    <div className="border-gray-medium-100 flex items-center justify-between border-b py-4">
      <div className="flex-1">
        <h3 className="text-gray-medium-400 mb-1 text-sm font-medium">
          {label}
        </h3>

        {isEditing ? (
          <div className="space-y-3">
            {renderEditingInput()}

            <div className="flex space-x-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="bg-blue-light-500 hover:bg-blue-light-600 focus:ring-blue-light-500 inline-flex items-center rounded border border-transparent px-3 py-1.5 text-xs font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
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
                onClick={onCancel}
                disabled={isSaving}
                className="border-gray-medium-200 text-gray-dark-500 hover:bg-gray-medium-50 focus:ring-blue-light-500 inline-flex items-center rounded border bg-white px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="mr-1 h-3 w-3" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-dark-500 font-medium">
            {renderDisplayValue()}
          </p>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={onEdit}
          className="text-blue-light-500 hover:text-blue-light-600 ml-4 text-sm font-medium"
        >
          <Pencil className="mr-1 inline h-4 w-4" />

          {value ? "Editar" : "Agregar"}
        </button>
      )}
    </div>
  );
}
