"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar,
  IdCard,
  Shield
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

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
  
  // Datos separados para nombre y apellido
  const [firstName, setFirstName] = useState("André");
  const [lastName, setLastName] = useState("Meléndez Cava");
  
  const [personalData, setPersonalData] = useState({
    email: user?.email || "",
    dni: "",
    phone: "",
    birthdate: "",
  });

  const [tempFirstName, setTempFirstName] = useState(firstName);
  const [tempLastName, setTempLastName] = useState(lastName);
  const [tempData, setTempData] = useState<any>({});

  const handleEdit = (field: EditingField) => {
    setEditingField(field);
    if (field === "name") {
      setTempFirstName(firstName);
      setTempLastName(lastName);
    } else if (field && field in personalData) {
      setTempData({ [field]: personalData[field as keyof typeof personalData] });
    }
  };

  const handleSave = () => {
    if (editingField === "name") {
      setFirstName(tempFirstName);
      setLastName(tempLastName);
    } else if (editingField && editingField in personalData) {
      setPersonalData(prev => ({ ...prev, ...tempData }));
    }
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setTempData({});
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
                  <p className="text-gray-dark-900 font-medium">{firstName} {lastName}</p>
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
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-dark-900 font-medium">
                    {personalData.email || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "email" && (
                <button
                  onClick={() => handleEdit("email")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {personalData.email ? "Editar" : "Agregar"}
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
                    {personalData.phone || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "phone" && (
                <button
                  onClick={() => handleEdit("phone")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {personalData.phone ? "Editar" : "Agregar"}
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
                    {personalData.dni || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "dni" && (
                <button
                  onClick={() => handleEdit("dni")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {personalData.dni ? "Editar" : "Agregar"}
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
                    {personalData.birthdate || "No proporcionado"}
                  </p>
                )}
              </div>
              {editingField !== "birthdate" && (
                <button
                  onClick={() => handleEdit("birthdate")}
                  className="text-blue-600 font-medium hover:text-blue-700 underline ml-4"
                >
                  {personalData.birthdate ? "Editar" : "Agregar"}
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