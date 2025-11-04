import React from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { formatDateForDisplay } from '@/src/utils/dateUtils';

interface ProfileFieldProps {
  label: string;
  value: string | null;
  fieldKey: string;
  type?: 'text' | 'email' | 'tel' | 'date';
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
  type = 'text',
  placeholder,
  isEditing,
  isSaving,
  tempValue = '',
  tempFirstName = '',
  tempLastName = '',
  onEdit,
  onSave,
  onCancel,
  onTempValueChange,
  onTempFirstNameChange,
  onTempLastNameChange,
}: ProfileFieldProps) {
  
  const renderDisplayValue = () => {
    if (fieldKey === 'name') {
      const firstName = value?.split('|')[0] || '';
      const lastName = value?.split('|')[1] || '';
      return firstName || lastName ? `${firstName} ${lastName}`.trim() : "No proporcionado";
    }
    
    if (fieldKey === 'birthdate') {
      return formatDateForDisplay(value);
    }
    
    return value || "No proporcionado";
  };

  const renderEditingInput = () => {
    if (fieldKey === 'name') {
      return (
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Nombre"
              value={tempFirstName}
              onChange={(e) => onTempFirstNameChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-medium-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Apellido"
              value={tempLastName}
              onChange={(e) => onTempLastNameChange?.(e.target.value)}
              className="w-full px-3 py-2 border border-gray-medium-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent"
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
        className="w-full px-3 py-2 border border-gray-medium-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-light-500 focus:border-transparent"
        disabled={isSaving}
      />
    );
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-medium-100">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-medium-400 mb-1">{label}</h3>
        {isEditing ? (
          <div className="space-y-3">
            {renderEditingInput()}
            <div className="flex space-x-2">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-light-500 hover:bg-blue-light-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-gray-medium-200 text-xs font-medium rounded text-gray-dark-500 bg-white hover:bg-gray-medium-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3 mr-1" />
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
          className="ml-4 text-blue-light-500 hover:text-blue-light-600 font-medium text-sm"
        >
          <Pencil className="h-4 w-4 inline mr-1" />
          {value ? "Editar" : "Agregar"}
        </button>
      )}
    </div>
  );
}