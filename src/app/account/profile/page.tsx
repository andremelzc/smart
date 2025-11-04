"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  User, 
  Briefcase, 
  Home as HomeIcon, 
  Clock,
  PawPrint,
  Globe,
  Edit3,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Datos del perfil público
  const [firstName] = useState("André");
  const [profileData, setProfileData] = useState({
    work: "Estudiante en UNMSM",
    location: "Países con clima frío",
    interests: "Escuchar música y ver videos",
    pets: "Tengo un perro que se llama Oreo",
    decade: "Nací en la década de los 00",
    bio: "Me encanta viajar y conocer nuevas culturas. Soy una persona responsable y respetuosa que siempre cuida los espacios donde se hospeda."
  });

  const [tempProfileData, setTempProfileData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setTempProfileData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempProfileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfileData(profileData);
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
              <div className="grid md:grid-cols-2 gap-6">
                {/* Work */}
                <div>
                  <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    value={tempProfileData.work}
                    onChange={(e) => setTempProfileData({...tempProfileData, work: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿A qué te dedicas?"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                    Lugares que quiero visitar
                  </label>
                  <input
                    type="text"
                    value={tempProfileData.location}
                    onChange={(e) => setTempProfileData({...tempProfileData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Destinos de tus sueños"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                    Intereses y pasatiempos
                  </label>
                  <input
                    type="text"
                    value={tempProfileData.interests}
                    onChange={(e) => setTempProfileData({...tempProfileData, interests: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Qué te gusta hacer?"
                  />
                </div>

                {/* Pets */}
                <div>
                  <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                    Mascotas
                  </label>
                  <input
                    type="text"
                    value={tempProfileData.pets}
                    onChange={(e) => setTempProfileData({...tempProfileData, pets: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="¿Tienes mascotas?"
                  />
                </div>

                {/* Decade */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                    Década de nacimiento
                  </label>
                  <input
                    type="text"
                    value={tempProfileData.decade}
                    onChange={(e) => setTempProfileData({...tempProfileData, decade: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Nací en la década de los 90"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-dark-700 mb-2">
                  Biografía
                </label>
                <textarea
                  value={tempProfileData.bio}
                  onChange={(e) => setTempProfileData({...tempProfileData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cuéntanos algo sobre ti..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
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
                  Guardar cambios
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
                      alt={firstName}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-5xl font-bold text-white">
                        {firstName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-dark-900 mb-1">
                    {firstName}
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
                {/* Bio */}
                {profileData.bio && (
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 leading-relaxed">
                        {profileData.bio}
                      </p>
                    </div>
                  </div>
                )}

                {profileData.work && (
                  <div className="flex items-start gap-4">
                    <Briefcase className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 font-medium">
                        Ocupación: {profileData.work}
                      </p>
                    </div>
                  </div>
                )}

                {profileData.location && (
                  <div className="flex items-start gap-4">
                    <HomeIcon className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 font-medium">
                        Lugares que quiero visitar: {profileData.location}
                      </p>
                    </div>
                  </div>
                )}

                {profileData.interests && (
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 font-medium">
                        Intereses: {profileData.interests}
                      </p>
                    </div>
                  </div>
                )}

                {profileData.pets && (
                  <div className="flex items-start gap-4">
                    <PawPrint className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 font-medium">
                        Mascotas: {profileData.pets}
                      </p>
                    </div>
                  </div>
                )}

                {profileData.decade && (
                  <div className="flex items-start gap-4">
                    <Globe className="w-6 h-6 text-gray-dark-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-dark-900 font-medium">
                        {profileData.decade}
                      </p>
                    </div>
                  </div>
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
    </div>
  );
}