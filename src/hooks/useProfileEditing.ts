import { useState } from 'react';
import { userService } from '@/src/services/user.service';
import type { UserProfileResponse, UserProfile } from '@/src/services/user.service';

type EditingField = 
  | "name" 
  | "email" 
  | "phone" 
  | "dni" 
  | "birthdate" 
  | null;

interface TempData {
  [key: string]: string;
}

interface UseProfileEditingProps {
  profileData: UserProfileResponse;
  onUpdate: (data: UserProfile) => Promise<boolean>;
  onMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

interface UseProfileEditingReturn {
  editingField: EditingField;
  tempData: TempData;
  tempFirstName: string;
  tempLastName: string;
  saving: boolean;
  handleEdit: (field: EditingField) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  setTempData: (data: TempData) => void;
  setTempFirstName: (name: string) => void;
  setTempLastName: (name: string) => void;
}

export function useProfileEditing({ 
  profileData, 
  onUpdate, 
  onMessage 
}: UseProfileEditingProps): UseProfileEditingReturn {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [tempData, setTempData] = useState<TempData>({});
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (field: EditingField) => {
    setEditingField(field);
    onMessage(null);
    
    if (field === "name") {
      setTempFirstName(profileData.firstName || '');
      setTempLastName(profileData.lastName || '');
    } else if (field === "birthdate" && profileData.birthDate) {
      // WORKAROUND: Sumar un día para compensar el problema de timezone al editar
      const date = new Date(profileData.birthDate);
      date.setDate(date.getDate() + 1);
      const adjustedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      setTempData({ [field]: adjustedDate });
    } else if (field) {
      const value = profileData[field as keyof UserProfileResponse];
      setTempData({ [field]: value || '' });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      onMessage(null);

      let updateData: UserProfile = {};
      let validationError = '';

      if (editingField === "name") {
        if (!tempFirstName.trim()) {
          validationError = 'El nombre es requerido';
        } else {
          updateData.firstName = tempFirstName.trim();
          updateData.lastName = tempLastName.trim();
        }
      } else if (editingField === "email") {
        const email = tempData.email?.trim();
        if (!email) {
          validationError = 'El email es requerido';
        } else if (!userService.validateEmail(email)) {
          validationError = 'Por favor ingresa un email válido';
        } else {
          updateData.email = email;
        }
      } else if (editingField === "phone") {
        const phone = tempData.phone?.trim();
        if (phone && !userService.validatePhone(phone)) {
          validationError = 'Por favor ingresa un teléfono válido (9 dígitos)';
        } else if (phone) {
          updateData.phone = phone;
        }
      } else if (editingField === "dni") {
        const dni = tempData.dni?.trim();
        if (dni && !userService.validateDni(dni)) {
          validationError = 'Por favor ingresa un DNI válido (8 dígitos)';
        } else if (dni) {
          updateData.dni = dni;
        }
      } else if (editingField === "birthdate") {
        const birthDate = tempData.birthdate;
        if (birthDate && !userService.validateBirthDate(birthDate)) {
          validationError = 'Por favor ingresa una fecha de nacimiento válida';
        } else if (birthDate) {
          updateData.birthDate = birthDate;
        }
      }

      if (validationError) {
        onMessage({
          type: 'error',
          text: validationError
        });
        return;
      }

      const success = await onUpdate(updateData);
      
      if (success) {
        setEditingField(null);
        setTempData({});
        setTempFirstName('');
        setTempLastName('');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      onMessage({
        type: 'error',
        text: 'Error al guardar los cambios'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempData({});
    setTempFirstName('');
    setTempLastName('');
    onMessage(null);
  };

  return {
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
  };
}