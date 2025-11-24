// app/host/crear_recinto/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { Paso1_TipoRecinto } from "@/src/components/host/crear-recinto/Paso1_TipoRecinto";
import { Paso3_Detalles } from "@/src/components/host/crear-recinto/Paso3_Detalles";
import { Paso4_Servicios } from "@/src/components/host/crear-recinto/Paso4_Servicios";
import { Paso5_Fotos } from "@/src/components/host/crear-recinto/Paso5_Fotos";
import { Paso6_TituloDescripcion } from "@/src/components/host/crear-recinto/Paso6_TituloDescripcion";
import { Paso7_Precio } from "@/src/components/host/crear-recinto/Paso7_Precio";
import { Paso8_Reglas } from "@/src/components/host/crear-recinto/Paso8_Reglas";
import { Paso9_Resumen } from "@/src/components/host/crear-recinto/Paso9_Resumen";
import { ProgressBar } from "@/src/components/host/crear-recinto/ProgressBar";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import dynamic from "next/dynamic";

// Cargar Paso2_Ubicacion dinámicamente solo en el cliente
const Paso2_Ubicacion = dynamic(
  () =>
    import("@/src/components/host/crear-recinto/Paso2_Ubicacion").then(
      (mod) => ({ default: mod.Paso2_Ubicacion })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="text-blue-light-600 h-8 w-8 animate-spin" />
        <span className="text-sm text-gray-600">Cargando mapa...</span>
      </div>
    ),
  }
);

const stepLabels = [
  "Tipo",
  "Ubicacion",
  "Detalles",
  "Servicios",
  "Fotos",
  "Titulo",
  "Precio",
  "Reglas",
  "Resumen",
];

interface PropertyImageData {
  url: string;
  caption: string;
  sortOrder: number;
}

interface PropertyData {
  title: string;
  propertyType: string;
  basePriceNight: number;
  currencyCode: string;
  addressText: string;
  formattedAddress: string;
  city: string;
  stateRegion: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  descriptionLong: string;
  houseRules: string;
  checkinTime: string;
  checkoutTime: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  areaM2: number;
  images: PropertyImageData[];
  amenities: string[];
}

const MIN_PRICE = 10;
const MIN_RULES_LENGTH = 20;

export default function PaginaCrearRecinto() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "",
    propertyType: "",
    basePriceNight: 50,
    currencyCode: "PEN",
    addressText: "Av. Larco 123",
    formattedAddress: "Av. Larco 123, Miraflores, Lima 15074, Peru",
    city: "Miraflores",
    stateRegion: "Lima",
    country: "Peru",
    postalCode: "15074",
    latitude: -12.1218,
    longitude: -77.0309,
    descriptionLong: "",
    houseRules: "No fumar en interiores.\nNo se permiten mascotas.",
    checkinTime: "15:00",
    checkoutTime: "11:00",
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    areaM2: 40,
    images: [],
    amenities: ["28.WIFI", "27.AC"],
  });

  const goToStep = (step: number) => {
    if (step === currentStep + 1 || step === currentStep - 1) {
      setCurrentStep(step);
    } else if (step < currentStep) {
      setCurrentStep(step);
    } else if (currentStep === 9 && step < 9) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 9) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<PropertyData>) => {
    setPropertyData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const isNextDisabled = () => {
    if (currentStep === 1 && propertyData.propertyType === "") {
      return true;
    }
    if (currentStep === 5 && propertyData.images.length === 0) {
      return true;
    }
    if (currentStep === 6) {
      if (propertyData.title.length < 20) return true;
      if (propertyData.descriptionLong.length < 50) return true;
    }
    if (currentStep === 7 && propertyData.basePriceNight < MIN_PRICE) {
      return true;
    }
    if (currentStep === 8) {
      if (propertyData.checkinTime === "") return true;
      if (propertyData.checkoutTime === "") return true;
      if (propertyData.houseRules.length < MIN_RULES_LENGTH) return true;
    }
    return false;
  };

  const handlePublish = () => {
    console.log("--- SIMULANDO PUBLICACION ---");
    console.log("DATOS A ENVIAR AL BACKEND:", propertyData);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
    setTimeout(() => {
      console.log("Redirigiendo a /host/dashboard");
      router.push("/host/dashboard");
    }, 1500);
  };

  return (
    <div className="bg-slate-50 pb-24">
      <ProgressBar
        steps={stepLabels}
        currentStep={currentStep}
        onStepClick={goToStep}
        isClickable={true}
      />

      <div className="mx-auto max-w-5xl p-6 md:p-12">
        <div className="min-h-[450px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {currentStep === 1 && (
            <Paso1_TipoRecinto
              data={{ propertyType: propertyData.propertyType }}
              updateData={updateData}
            />
          )}
          {currentStep === 2 && (
            <Paso2_Ubicacion
              data={{
                addressText: propertyData.addressText,
                city: propertyData.city,
                stateRegion: propertyData.stateRegion,
                country: propertyData.country,
                postalCode: propertyData.postalCode,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 3 && (
            <Paso3_Detalles
              data={{
                capacity: propertyData.capacity,
                bedrooms: propertyData.bedrooms,
                beds: propertyData.beds,
                bathrooms: propertyData.bathrooms,
                areaM2: propertyData.areaM2,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 4 && (
            <Paso4_Servicios
              data={{
                amenities: propertyData.amenities,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 5 && (
            <Paso5_Fotos
              data={{
                images: propertyData.images,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 6 && (
            <Paso6_TituloDescripcion
              data={{
                title: propertyData.title,
                descriptionLong: propertyData.descriptionLong,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 7 && (
            <Paso7_Precio
              data={{
                basePriceNight: propertyData.basePriceNight,
                currencyCode: propertyData.currencyCode,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 8 && (
            <Paso8_Reglas
              data={{
                houseRules: propertyData.houseRules,
                checkinTime: propertyData.checkinTime,
                checkoutTime: propertyData.checkoutTime,
              }}
              updateData={updateData}
            />
          )}
          {currentStep === 9 && (
            <Paso9_Resumen data={propertyData} goToStep={goToStep} />
          )}
        </div>

        {/* MEJORA: Todos los botones juntos en una sola fila */}
        <div className="mt-8 flex items-center justify-between">
          {/* Botón Atrás */}
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
            // className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CircleChevronLeft className="h-5 w-5" />
            Atrás
          </Button>

          {/* Grupo central: Guardar y Salir (solo visible si no estamos en el último paso) */}
          {currentStep < 9 && (
            <Button
              variant="secondary"
              onClick={() => router.push("/host/dashboard")}
              // className="flex items-center gap-2 rounded-2xl bg-white border-2 border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
              aria-label="Guardar y salir del editor"
            >
              <X className="h-4 w-4" />
              Guardar y Salir
            </Button>
          )}

          {/* Botón Siguiente o Publicar */}
          {currentStep < 9 ? (
            <Button
              onClick={nextStep}
              disabled={isNextDisabled()}
              // className="flex items-center gap-2 rounded-xl bg-blue-600 border-2 border-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <CircleChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="accept"
              onClick={handlePublish}
              // className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm border-2 border-green-700 transition-all hover:bg-green-700 hover:border-green-800"
            >
              Confirmar y Publicar
            </Button>
          )}
        </div>
      </div>

      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-700 bg-slate-800 px-6 py-4 text-white shadow-lg">
          <CheckCircle className="h-6 w-6 text-green-400" />
          <span className="font-medium">
            Se agregó el recinto correctamente
          </span>
          <Button
            onClick={() => setShowSuccessToast(false)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
