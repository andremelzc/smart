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
  Edit3,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useProfileDetails } from "@/src/hooks/useProfileDetails";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { profileData: spProfileData, preferences, loading, message, updateProfileDetails } = useProfileDetails();
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para las preferencias editables
  const [editablePreferences, setEditablePreferences] = useState<{[key: number]: string}>({});
  const [editableBio, setEditableBio] = useState('');
  
  // Datos del perfil público estático (fallback)
  const profileData = {
    bio: "Me encanta viajar y conocer nuevas culturas. Soy una persona responsable y respetuosa que siempre cuida los espacios donde se hospeda."
  };

  // Inicializar valores editables cuando cambien las preferencias
  useEffect(() => {
    if (preferences.length > 0) {
      const prefValues: {[key: number]: string} = {};
      preferences.forEach(pref => {
        prefValues[pref.preferenceId] = pref.valueText || '';
      });
      // Use startTransition to avoid cascading renders
      startTransition(() => {
        setEditablePreferences(prefValues);
      });
    }
  }, [preferences]);

  // Separate effect for bio to avoid cascading renders
  useEffect(() => {
    const bio = spProfileData?.bio || profileData.bio || '';
    // Use startTransition to avoid cascading renders
    startTransition(() => {
      setEditableBio(bio);
    });
  }, [spProfileData?.bio, profileData.bio]);

  const handleEdit = () => {
    setIsEditing(true);
    // Los valores ya están sincronizados en el useEffect
  };

  const handleSave = async () => {
    try {
      // Convertir las preferencias editables al formato esperado por la API
      const preferencesToUpdate = preferences.map(pref => ({
        code: pref.code,
        value: editablePreferences[pref.preferenceId] || ''
      }));

      console.log('Saving changes:', {
        bio: editableBio,
        preferences: preferencesToUpdate
      });

      // Llamar al hook para actualizar
      const success = await updateProfileDetails(editableBio, preferencesToUpdate);
      
      if (success) {
        setIsEditing(false);
      }
      // Si hay error, el mensaje se muestra automáticamente via el hook
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales
    if (preferences.length > 0) {
      const prefValues: {[key: number]: string} = {};
      preferences.forEach(pref => {
        prefValues[pref.preferenceId] = pref.valueText || '';
      });
      setEditablePreferences(prefValues);
    }
    setEditableBio(spProfileData?.bio || profileData.bio || '');
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-blue-light-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-light-500" />
        </div>
        <p className="text-gray-dark-600 text-lg">
          Debes iniciar sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-dark-900 mb-2">
          Mi perfil público
        </h1>
        <p className="text-gray-dark-600">
          Esta es la información que otros usuarios ven cuando visitan tu perfil. Ayuda a generar confianza y conectar con la comunidad.
        </p>
      </div>

      {/* Main Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-dark-900">
            Acerca de mí
          </h2>
          {!isEditing && (
            <button 
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 border border-gray-dark-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
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
                <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                  Biografía
                </label>
                <textarea
                  value={editableBio}
                  onChange={(e) => setEditableBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cuéntanos algo sobre ti..."
                />
              </div>

              {/* Preferencias dinámicas */}
              <div className="grid md:grid-cols-2 gap-6">
                {preferences?.map((preference) => (
                  <div key={preference.preferenceId}>
                    <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                      {preference.name}
                    </label>
                    <input
                      type="text"
                      value={editablePreferences[preference.preferenceId] || ''}
                      onChange={(e) => {
                        setEditablePreferences(prev => ({
                          ...prev,
                          [preference.preferenceId]: e.target.value
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={preference.description}
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="text-gray-dark-700 font-medium hover:text-gray-dark-900 underline disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar Card */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="text-center">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={spProfileData?.firstName || user?.name || "Usuario"}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-5xl font-bold text-white">
                        {(spProfileData?.firstName || user?.name || "U").charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-dark-900 mb-1">
                    {spProfileData?.firstName ? 
                      `${spProfileData.firstName} ${spProfileData.lastName || ''}`.trim() : 
                      user?.name || "Usuario"
                    }
                  </h3>
                  <p className="text-gray-dark-500 mb-4">Huésped</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-dark-900">8</p>
                      <p className="text-sm text-gray-dark-500">Viajes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-dark-900">4.9</p>
                      <p className="text-sm text-gray-dark-500">Calificación</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info List */}
              <div className="flex-1 space-y-6">
                {/* Bio - usar datos del SP cuando estén disponibles */}
                {(spProfileData?.bio || profileData.bio) && (
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 leading-relaxed">
                        {spProfileData?.bio || profileData.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Renderizar preferencias dinámicamente desde el SP */}
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-48 animate-pulse"></div>
                  </div>
                ) : (
                  preferences?.map((preference) => {
                    // Solo mostrar preferencias que tienen valores
                    if (!preference.valueText) return null;
                    
                    // Mapear iconos según el código de preferencia
                    const getIcon = (code: string) => {
                      switch (code) {
                        case 'WORK':
                          return <Briefcase className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        case 'LOCATION':
                          return <HomeIcon className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        case 'INTERESTS':
                          return <Clock className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        case 'PETS':
                          return <PawPrint className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        case 'LANGUAGE':
                          return <Globe className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        case 'SCHOOL':
                          return <User className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                        default:
                          return <AlertCircle className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />;
                      }
                    };

                    return (
                      <div key={preference.preferenceId} className="flex items-start gap-4">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Tu perfil público
            </h4>
            <p className="text-sm text-blue-800">
              Esta información es visible para otros usuarios de la plataforma. Ayuda a generar confianza y conectar con anfitriones y otros huéspedes.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes del sistema */}
      {message && (
        <div className={`border-l-4 rounded-lg p-4 shadow-sm ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-400' 
            : 'bg-green-50 border-green-400'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              message.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`} />
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${
                message.type === 'error' ? 'text-red-900' : 'text-green-900'
              }`}>
                {message.type === 'error' ? 'Error' : 'Éxito'}
              </h3>
              <p className={`text-sm ${
                message.type === 'error' ? 'text-red-800' : 'text-green-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}