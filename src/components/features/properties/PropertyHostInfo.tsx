'use client';

import { Users, Bed, Bath, Shield } from 'lucide-react';

interface Host {
  name: string;
  isVerified?: boolean;
  memberSince?: string;
}

interface PropertyHostInfoProps {
  propertyType: string;
  host: Host;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  beds?: number;
  className?: string;
}

export function PropertyHostInfo({
  propertyType,
  host,
  capacity,
  bedrooms,
  bathrooms,
  beds,
  className = ''
}: PropertyHostInfoProps) {
  const formatMemberSince = (memberSince?: string) => {
    try {
      const date = typeof memberSince === 'string' 
        ? new Date(memberSince)
        : new Date();
      return date.getFullYear();
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getHostInitial = (name: string) => {
    return typeof name === 'string' && name.length > 0
      ? name.charAt(0).toUpperCase()
      : 'H';
  };

  const formatHostName = (name: string) => {
    return typeof name === 'string' ? name : 'Anfitrión';
  };

  return (
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            {typeof propertyType === 'string' ? propertyType : 'Alojamiento'} hospedado por {formatHostName(host.name)}
          </h2>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {typeof capacity === 'number' ? capacity : 0} huéspedes
            </span>
            
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {typeof bedrooms === 'number' ? bedrooms : 0} habitaciones
            </span>
            
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {typeof bathrooms === 'number' ? bathrooms : 0} baños
            </span>
            
            {beds && beds > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {typeof beds === 'number' ? beds : 0} camas
              </span>
            )}
          </div>
        </div>
        
        <div className="w-12 h-12 bg-blue-light-500 rounded-full flex items-center justify-center ml-4">
          <span className="text-xl font-semibold text-white">
            {getHostInitial(host.name)}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {host.isVerified && (
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Anfitrión verificado</span>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          Miembro desde {formatMemberSince(host.memberSince)}
        </div>
      </div>
    </div>
  );
}