"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PropertyEditForm from "@/src/components/features/properties/PropertyEditForm";
import { usePropertyEdit } from "@/src/hooks/usePropertyEdit";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = parseInt(params.id as string);

  const { propertyData, isLoading, error } = usePropertyEdit(propertyId);

  const handleSuccess = () => {
    // Redirect back to properties list after successful update
    router.push("/host/properties");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isNaN(propertyId)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            ID de Propiedad Invalido
          </h1>
          <p className="mb-6 text-gray-600">
            El ID de la propiedad proporcionado no es valido.
          </p>
          <Button onClick={() => router.push("/host/properties")}>
            Volver a Propiedades
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-blue-light-500 h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Error al Cargar la Propiedad
          </h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button onClick={() => router.push("/host/properties")}>
              Volver a Propiedades
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleCancel}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Propiedad</h1>
          <p className="text-gray-600">ID: {propertyId}</p>
        </div>
      </div>

      {/* Property Edit Form */}
      <PropertyEditForm
        propertyId={propertyId}
        initialData={propertyData || {}}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
