// En: src/app/host/properties/[propertyId]/availability/page.tsx

import { Suspense } from 'react';
import Link from 'next/link';
import { AvailabilityCalendar } from '@/src/components/features/host/AvailabilityCalendar';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ propertyId: string }>;
};

export default async function AvailabilityPage({ params }: Props) {
  const { propertyId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón de volver */}
      <div className="mb-6">
        <Link href="/host/properties">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Volver a Mis Propiedades
          </Button>
        </Link>
      </div>

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Calendario</h1>
        <p className="text-muted-foreground mt-2">
          Administra la disponibilidad de tu propiedad
        </p>
      </div>

      {/* Calendario de disponibilidad */}
      <div className="mt-6">
        <Suspense fallback={
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        }>
          <AvailabilityCalendar propertyId={propertyId} />
        </Suspense>
      </div>
    </div>
  );
}