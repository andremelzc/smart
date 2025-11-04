// src/components/host/crear-recinto/Paso2_Ubicacion.tsx
import { MapPin, Search } from 'lucide-react';
import { useState } from 'react';

interface StepProps {
  data: {
    addressText: string;
    city: string;
    stateRegion: string;
    country: string;
    postalCode: string;
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}

const mapBackgroundStyle = {
  backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/c/c6/Map_Lima_District.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

export function Paso2_Ubicacion({ data, updateData }: StepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pinPosition, setPinPosition] = useState({ x: 250, y: 150 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  
  // Simulación de búsqueda de dirección
  const handleSimulateSearch = () => {
    updateData({
      addressText: data.addressText || "Av. José Larco 123",
      city: "Miraflores",
      stateRegion: "Lima",
      country: "Perú",
      postalCode: "15074",
    });
    setPinPosition({ x: 300, y: 160 });
  };


  const simulatePinDrop = () => {
    updateData({
      addressText: "Av. Amezaga 15081",
      city: "Cercado de Lima", 
    });
  };

  
  const handlePinMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsDragging(true);
  };

  const handlePinMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      simulatePinDrop(); 
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const mapRect = e.currentTarget.getBoundingClientRect();

    const newX = e.clientX - mapRect.left - 12;
    const newY = e.clientY - mapRect.top - 12;

    const clampedX = Math.max(0, Math.min(newX, mapRect.width - 24));
    const clampedY = Math.max(0, Math.min(newY, mapRect.height - 24));

    setPinPosition({ x: clampedX, y: clampedY });
  };

  const handleMapMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      simulatePinDrop();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-light-800">
          Ubicación del Recinto
        </h1>
        <p className="mt-2 text-lg text-gray-dark-500">
          La dirección solo se compartirá con los huéspedes después de que 
          confirmen una reserva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Dirección (ocupa 2 columnas) */}
        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700 md:col-span-2">
          Dirección (Calle y Número)
          <div className="flex gap-2">
            <input
              type="text"
              name="addressText"
              value={data.addressText}
              onChange={handleChange}
              placeholder="Ej: Av. Larco 123"
              className="flex-grow rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={handleSimulateSearch}
              className="flex-shrink-0 inline-flex items-center justify-center rounded-2xl border-blue-light-600 bg-blue-vivid-600 border-2  px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-vivid-700 hover:border-blue-light-800"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Distrito
          <input type="text" name="city" value={data.city} onChange={handleChange} placeholder="Ej: Miraflores" className="rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 font-medium outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Estado / Región
          <input type="text" name="stateRegion" value={data.stateRegion} onChange={handleChange} placeholder="Ej: Lima" className="rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100" />
        </label>
        
        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          País
          <input type="text" name="country" value={data.country} onChange={handleChange} placeholder="Ej: Perú" className="rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Código Postal
          <input type="text" name="postalCode" value={data.postalCode} onChange={handleChange} placeholder="Ej: 15074" className="rounded-2xl  font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100" />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-lg font-medium text-gray-dark-600 mb-2">
          Arrastra el pin para ajustar la ubicación exacta:
        </p>
        
        <div
          className="w-full h-80 rounded-2xl border-2 border-blue-light-300 relative overflow-hidden"
          style={mapBackgroundStyle}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handlePinMouseUp}
          onMouseLeave={handleMapMouseLeave} 
        >
          <div
            className="absolute w-6 h-6"
            style={{
              left: `${pinPosition.x}px`,
              top: `${pinPosition.y}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: 10,
            }}
            onMouseDown={handlePinMouseDown}
            onMouseUp={handlePinMouseUp} 
          >
            <MapPin className="w-6 h-6 text-blue-light-700 drop-shadow-lg" />
          </div>
        </div>
      </div>

    </div>
  );
}