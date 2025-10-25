"use client";

import React, { useState } from "react";
import { User, Mail, Calendar, MapPin, Save } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // TODO: Implementar guardado
    console.log("Guardando datos:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      location: "",
      bio: "",
    });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Debes iniciar sesión para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información personal</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y preferencias</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Usuario"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="text-gray-900">{formData.name || "No especificado"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo electrónico
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              ) : (
                <p className="text-gray-900">{formData.email || "No especificado"}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 234 567 8900"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || "No especificado"}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ciudad, País"
                />
              ) : (
                <p className="text-gray-900">{formData.location || "No especificado"}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acerca de ti
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cuéntanos un poco sobre ti..."
                />
              ) : (
                <p className="text-gray-900">{formData.bio || "No especificado"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de la cuenta
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID de usuario:</span>
            <span className="text-gray-900 font-mono text-xs">
              {user?.id || "No disponible"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de cuenta:</span>
            <span className="text-gray-900">
              {user?.roles?.includes('host') ? 'Anfitrión' : 'Huésped'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Activa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}