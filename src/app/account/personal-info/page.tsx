"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar,
  IdCard,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { userService, UserProfileResponse, UserProfile } from "@/src/services/user.service";

type EditingField = 
  | "name" 
  | "email" 
  | "phone" 
  | "dni" 
  | "birthdate" 
  | null;

export default function PersonalInfoPage() {
  const { user, isAuthenticated } = useAuth();
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Datos del perfil
  const [profileData, setProfileData] = useState<UserProfileResponse>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    dni: null,
    birthDate: null,
    createdAt: '',
    updatedAt: ''
  });

  // Datos temporales para edición
  const [tempFirstName, setTempFirstName] = useState('');
  const [tempLastName, setTempLastName] = useState('');
  const [tempData, setTempData] = useState<any>({});

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfileData(data);
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: EditingField) => {
    setEditingField(field);
    setMessage(null);
    
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
      setMessage(null);

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
          validationError = 'El formato del email no es válido';
        } else {
          updateData.email = email;
        }
      } else if (editingField === "phone") {
        const phone = tempData.phone?.trim();
        if (phone && !userService.validatePhone(phone)) {
          validationError = 'El formato del teléfono no es válido (ej: +51 999 999 999)';
        } else if (phone) {
          updateData.phone = phone;
        }
      } else if (editingField === "dni") {
        const dni = tempData.dni?.trim();
        if (dni && !userService.validateDni(dni)) {
          validationError = 'El DNI debe tener 8 dígitos';
        } else if (dni) {
          updateData.dni = dni;
        }
      } else if (editingField === "birthdate") {
        const birthDate = tempData.birthdate;
        if (birthDate && !userService.validateBirthDate(birthDate)) {
          validationError = 'La fecha de nacimiento no es válida';
        } else if (birthDate) {
          updateData.birthDate = birthDate;
        }
      }

      if (validationError) {
        setMessage({ type: 'error', text: validationError });
        return;
      }

      // Actualizar en la base de datos
      const response = await userService.updateProfile(updateData);
      
      if (response.success) {
        // Actualizar los datos locales
        setProfileData(prev => ({
          ...prev,
          ...updateData,
          updatedAt: new Date().toISOString()
        }));
        
        setEditingField(null);
        setMessage({ type: 'success', text: 'Información actualizada exitosamente' });

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(null), 3000);
      }

    } catch (error: any) {
      console.error('Error guardando:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempFirstName('');
    setTempLastName('');
    setTempData({});
    setMessage(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-blue-light-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-light-500" />
        </div>
        <p className="text-gray-dark-600 text-lg">
          Debes iniciar sesión para ver tu información personal.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Cargando información personal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-dark-900 mb-2">
          Información personal
        </h1>
        <p className="text-gray-dark-600">
          Gestiona tus datos personales y de verificación. Esta información es privada y solo la usamos para verificar tu identidad y facilitar las comunicaciones.
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            <p className={`font-medium ${
              message.type === 'error' ? 'text-red-800' : 'text-green-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Información privada */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="space-y-0">
          {/* Nombre legal */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <IdCard className="w-5 h-5 text-gray-dark-600" />
                  <h3 className="text-base font-semibold text-gray-dark-900">
                    Nombre legal
                  </h3>
                </div>
                <p className="text-sm text-gray-dark-500 mb-3">
                  Asegúrate de que coincide con el nombre que aparece en tu documento de identidad oficial.
                </p>
                {editingField === "name" ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-dark-700 mb-2">
                          Nombre que aparece en el documento de identidad
                        </label>
                        <input
                          type="text"
                          value={tempFirstName}
                          onChange={(e) => setTempFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-dark-700 mb-2">
                          Apellidos que aparecen en el documento de identidad
                        </label>
                        <input
                          type="text"
                          value={tempLastName}
                          onChange={(e) => setTempLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline disabled:text-gray-400"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {profileData.firstName && profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : "No proporcionado"
                    }
                  </p>
                )}
              </div>
              {editingField !== "name" && (
                <button
                  onClick={() => handleEdit("name")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  Editar
                </button>
              )}
            </div>
          </div>

          {/* Dirección de correo electrónico */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-gray-dark-600" />
                  <h3 className="text-base font-semibold text-gray-dark-900">
                    Dirección de correo electrónico
                  </h3>
                </div>
                <p className="text-sm text-gray-dark-500 mb-3">
                  Para comunicaciones importantes y notificaciones de tu cuenta.
                </p>
                {editingField === "email" ? (
                  <div className="mt-4 space-y-4">
                    <input
                      type="email"
                      value={tempData.email || ""}
                      onChange={(e) => setTempData({ email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="correo@ejemplo.com"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {profileData.email || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "email" && (
                <button
                  onClick={() => handleEdit("email")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {profileData.email ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
          </div>

          {/* Números de teléfono */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-5 h-5 text-gray-dark-600" />
                  <h3 className="text-base font-semibold text-gray-dark-900">
                    Número de teléfono
                  </h3>
                </div>
                <p className="text-sm text-gray-dark-500 mb-3">
                  Para contacto directo y verificación de cuenta cuando sea necesario.
                </p>
                {editingField === "phone" ? (
                  <div className="mt-4 space-y-4">
                    <input
                      type="tel"
                      value={tempData.phone || ""}
                      onChange={(e) => setTempData({ phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="+51 999 999 999"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {profileData.phone || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "phone" && (
                <button
                  onClick={() => handleEdit("phone")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {profileData.phone ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
          </div>

          {/* DNI */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-gray-dark-600" />
                  <h3 className="text-base font-semibold text-gray-dark-900">
                    Documento de identidad
                  </h3>
                </div>
                <p className="text-sm text-gray-dark-500 mb-3">
                  Tu DNI o documento oficial para verificación de identidad.
                </p>
                {editingField === "dni" ? (
                  <div className="mt-4 space-y-4">
                    <input
                      type="text"
                      value={tempData.dni || ""}
                      onChange={(e) => setTempData({ dni: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="12345678"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {profileData.dni || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "dni" && (
                <button
                  onClick={() => handleEdit("dni")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {profileData.dni ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-gray-dark-600" />
                  <h3 className="text-base font-semibold text-gray-dark-900">
                    Fecha de nacimiento
                  </h3>
                </div>
                <p className="text-sm text-gray-dark-500 mb-3">
                  Para verificación de edad y cumplimiento de políticas.
                </p>
                {editingField === "birthdate" ? (
                  <div className="mt-4 space-y-4">
                    <input
                      type="date"
                      value={tempData.birthdate || ""}
                      onChange={(e) => setTempData({ birthdate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {profileData.birthDate ? 
                      (() => {
                        // WORKAROUND: Sumar un día para compensar el problema de timezone
                        const date = new Date(profileData.birthDate);
                        date.setDate(date.getDate() + 1);
                        return date.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      })()
                      : "No proporcionado"
                    }
                  </p>
                )}
              </div>
              {editingField !== "birthdate" && (
                <button
                  onClick={() => handleEdit("birthdate")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {profileData.birthDate ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Tu información está protegida
            </h4>
            <p className="text-sm text-blue-800">
              Todos tus datos personales están encriptados y solo se utilizan para verificación de identidad y comunicación necesaria. Nunca compartimos esta información con otros usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}