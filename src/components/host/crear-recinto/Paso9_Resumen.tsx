// src/components/host/crear-recinto/Paso9_Resumen.tsx

import Image from "next/image";
import { StepHeader } from "./StepHeader";
import {
  Edit,
  Camera,
  Home,
  MapPin,
  Users,
  Sparkles,
  DollarSign,
  ListChecks,
} from "lucide-react";

interface ImageItem {
  url: string;
  caption?: string;
  sortOrder?: number | string;
}

interface SummaryData {
  title?: string;
  propertyType?: string;
  capacity?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  areaM2?: number;
  amenities?: unknown[];
  checkinTime?: string;
  checkoutTime?: string;
  houseRules?: string;
  images?: ImageItem[];
  addressText?: string;
  city?: string;
  stateRegion?: string;
  country?: string;
  postalCode?: string;
  currencyCode?: string;
  basePriceNight?: number;
}

interface StepProps {
  data: SummaryData;
  goToStep: (step: number) => void;
}

interface ResumenSectionProps {
  title: string;
  editStep: number;
  icon: React.ReactNode;
  children: React.ReactNode;
  goToStep: (step: number) => void;
}

function ResumenSection({
  title,
  editStep,
  icon,
  children,
  goToStep,
}: ResumenSectionProps) {
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        </div>

        <button
          onClick={() => goToStep(editStep)}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar
        </button>
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}

export function Paso9_Resumen({ data, goToStep }: StepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: data.currencyCode || "PEN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="¡Casi listo! Revisa tu anuncio"
        subtitle="Confirma que toda la información sea correcta. Este es el anuncio que verán los huéspedes."
        helpText="Puedes hacer clic en 'Editar' en cualquier sección para volver y hacer cambios. Cuando estés listo, publica tu recinto!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <ResumenSection
            title="Título y Tipo"
            editStep={1}
            goToStep={goToStep}
            icon={<Home className="w-5 h-5 text-slate-600" />}
          >
            <h4 className="text-base font-semibold text-slate-800">
              {data.title || "Sin título"}
            </h4>
            <p className="text-sm text-slate-600 capitalize">
              {data.propertyType || "Sin tipo"}
            </p>
          </ResumenSection>

          <ResumenSection
            title="Detalles del Espacio"
            editStep={3}
            goToStep={goToStep}
            icon={<Users className="w-5 h-5 text-slate-600" />}
          >
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>{data.capacity ?? 0} huéspedes</li>
              <li>
                {data.bedrooms ?? 0}{" "}
                {data.bedrooms === 1 ? "habitación" : "habitaciones"}
              </li>
              <li>
                {data.beds ?? 0} {data.beds === 1 ? "cama" : "camas"}
              </li>
              <li>
                {data.bathrooms ?? 0} {data.bathrooms === 1 ? "baño" : "baños"}
              </li>
              {typeof data.areaM2 === "number" && data.areaM2 > 0 && (
                <li>{data.areaM2} m²</li>
              )}
            </ul>
          </ResumenSection>

          <ResumenSection
            title="Servicios"
            editStep={4}
            goToStep={goToStep}
            icon={<Sparkles className="w-5 h-5 text-slate-600" />}
          >
            <p className="text-sm text-slate-700">
              {Array.isArray(data.amenities) ? data.amenities.length : 0}{" "}
              {Array.isArray(data.amenities) && data.amenities.length === 1
                ? "servicio seleccionado"
                : "servicios seleccionados"}
              .
            </p>
          </ResumenSection>

          <ResumenSection
            title="Reglas y Horarios"
            editStep={8}
            goToStep={goToStep}
            icon={<ListChecks className="w-5 h-5 text-slate-600" />}
          >
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                <span className="font-medium">Check-in:</span>{" "}
                {data.checkinTime || "No definido"}
              </p>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Check-out:</span>{" "}
                {data.checkoutTime || "No definido"}
              </p>
              {data.houseRules && (
                <p className="text-sm text-slate-700 mt-3 whitespace-pre-line">
                  {data.houseRules}
                </p>
              )}
            </div>
          </ResumenSection>
        </div>

        <div className="flex flex-col gap-4">
          <ResumenSection
            title="Fotos"
            editStep={5}
            goToStep={goToStep}
            icon={<Camera className="w-5 h-5 text-slate-600" />}
          >
            <div className="grid grid-cols-3 gap-2">
              {Array.isArray(data.images) &&
                data.images.slice(0, 3).map((img, idx) => (
                  <div
                    key={img.sortOrder ?? idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                  >
                    <Image
                      src={img.url || "/placeholder-room.svg"}
                      alt={img.caption ?? `Foto ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                      className="object-cover"
                    />
                  </div>
                ))}

              {Array.isArray(data.images) && data.images.length > 3 && (
                <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-semibold rounded-lg border border-slate-200">
                  +{data.images.length - 3} más
                </div>
              )}

              {(!Array.isArray(data.images) || data.images.length === 0) && (
                <div className="col-span-3 aspect-video bg-slate-100 flex items-center justify-center text-slate-500 text-sm rounded-lg border border-slate-200">
                  Sin fotos
                </div>
              )}
            </div>
          </ResumenSection>

          <ResumenSection
            title="Ubicación"
            editStep={2}
            goToStep={goToStep}
            icon={<MapPin className="w-5 h-5 text-slate-600" />}
          >
            <div className="space-y-1">
              <p className="text-sm text-slate-700">
                {data.addressText || "Dirección no especificada"}
              </p>
              {data.city && data.stateRegion && (
                <p className="text-sm text-slate-700">
                  {data.city}, {data.stateRegion}
                </p>
              )}
              {data.country && data.postalCode && (
                <p className="text-sm text-slate-700">
                  {data.country}, {data.postalCode}
                </p>
              )}
            </div>
          </ResumenSection>

          <ResumenSection
            title="Precio"
            editStep={7}
            goToStep={goToStep}
            icon={<DollarSign className="w-5 h-5 text-slate-600" />}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800">
                {formatCurrency(data.basePriceNight ?? 0)}
              </span>
              <span className="text-sm text-slate-600">/ noche</span>
            </div>
          </ResumenSection>
        </div>
      </div>
    </div>
  );
}
