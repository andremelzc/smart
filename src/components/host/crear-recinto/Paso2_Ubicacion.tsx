"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface StepProps {
  data: {
    addressText: string;
    city: string;
    stateRegion: string;
    country: string;
    postalCode: string;
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

// Componente para manejar el marcador arrastrable
function DraggableMarker({ 
  position, 
  onPositionChange 
}: { 
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    />
  );
}

// Componente para manejar clics en el mapa
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Componente para centrar el mapa cuando cambia la posición
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function Paso2_Ubicacion({ data, updateData }: StepProps) {
  const [isClient, setIsClient] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([-12.0464, -77.0428]); // Lima centro
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchInput, setSearchInput] = useState(data.addressText || "");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lista de distritos de Lima conocidos
  const LIMA_DISTRICTS = [
    'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina', 
    'San Borja', 'Jesús María', 'Lince', 'Magdalena', 'Pueblo Libre',
    'San Miguel', 'Cercado de Lima', 'Lima', 'Breña', 'La Victoria',
    'Surquillo', 'Chorrillos', 'San Juan de Miraflores', 'Villa María del Triunfo',
    'Villa El Salvador', 'Ate', 'Santa Anita', 'El Agustino', 'San Luis',
    'Callao', 'Bellavista', 'La Perla', 'Carmen de la Legua', 'Ventanilla',
    'Los Olivos', 'San Martín de Porres', 'Independencia', 'Comas',
    'Carabayllo', 'Puente Piedra', 'Ancón', 'Santa Rosa', 'Rímac',
    'San Juan de Lurigancho', 'Lurigancho', 'Chaclacayo', 'Cieneguilla'
  ];

  // Función auxiliar para encontrar distrito en el texto
  const findDistrictInText = useCallback((text: string): string | null => {
    const normalized = text.toLowerCase();
    for (const district of LIMA_DISTRICTS) {
      if (normalized.includes(district.toLowerCase())) {
        return district;
      }
    }
    return null;
  }, []);

  // Geocodificación inversa (coordenadas → dirección)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // Hacer query con zoom alto para obtener más detalles
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Intentar extraer la calle y número de múltiples fuentes
        let streetAddress = '';
        
        // Prioridad 1: road + house_number
        if (address.road) {
          streetAddress = address.road;
          if (address.house_number) {
            streetAddress += ' ' + address.house_number;
          }
        }
        
        // Prioridad 2: Si no hay road, intentar con highway, street, o pedestrian
        if (!streetAddress) {
          const roadType = address.highway || address.street || address.pedestrian;
          if (roadType) {
            streetAddress = roadType;
            if (address.house_number) {
              streetAddress += ' ' + address.house_number;
            }
          }
        }
        
        // Prioridad 3: Buscar en el display_name una dirección tipo "Av. X 123"
        if (!streetAddress) {
          const displayParts = data.display_name.split(',');
          const firstPart = displayParts[0]?.trim() || '';
          
          // Verificar si tiene patrón de dirección (contiene "Av." "Jr." "Ca." "Calle" etc)
          if (/^(Av\.|Avenida|Jr\.|Jirón|Ca\.|Calle|Psje\.|Pasaje)/i.test(firstPart)) {
            streetAddress = firstPart;
          }
        }
        
        // Si aún no hay dirección, usar el primer elemento del display_name
        if (!streetAddress) {
          streetAddress = data.display_name.split(',')[0]?.trim() || '';
        }
        
        // Buscar distrito en varias propiedades y en el display_name
        let district = address.suburb || 
                      address.neighbourhood || 
                      address.city_district || 
                      address.municipality ||
                      address.city ||
                      address.town ||
                      address.village ||
                      '';
        
        // Si no encontró distrito, buscar en el display_name completo
        if (!district || district === 'Lima') {
          const foundDistrict = findDistrictInText(data.display_name);
          if (foundDistrict) {
            district = foundDistrict;
          }
        }
        
        // Actualizar el input de búsqueda también
        setSearchInput(streetAddress);
        
        updateData({
          addressText: streetAddress,
          city: district,
          stateRegion: address.state || address.region || 'Lima',
          country: address.country || 'Perú',
          postalCode: address.postcode || '',
        });
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    } finally {
      setIsGeocoding(false);
    }
  }, [updateData, findDistrictInText]);

  // Geocodificación directa (dirección → coordenadas)
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsGeocoding(true);
    try {
      // Primero intentar con Perú específicamente
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput + ', Lima, Peru')}&limit=3&addressdetails=1`
      );
      let results = await response.json();
      
      // Si no encuentra nada, intentar sin "Peru"
      if (!results || results.length === 0) {
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&countrycodes=pe&limit=3&addressdetails=1`
        );
        results = await response.json();
      }
      
      if (results && results.length > 0) {
        // Preferir resultados en Lima
        const result = results.find((r: {address?: {state?: string; city?: string}; display_name?: string}) => {
          const addr = r.address || {};
          return addr.state?.toLowerCase().includes('lima') || 
                 addr.city?.toLowerCase().includes('lima') ||
                 findDistrictInText(r.display_name || '');
        }) || results[0];
        
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setMarkerPosition([lat, lng]);
        
        // Actualizar campos con la información de la búsqueda
        const address = result.address || {};
        let district = address.suburb || 
                      address.neighbourhood || 
                      address.city_district || 
                      address.municipality ||
                      address.city ||
                      address.town ||
                      '';
        
        // Buscar distrito en el display_name si no se encontró
        if (!district || district === 'Lima') {
          const foundDistrict = findDistrictInText(result.display_name);
          if (foundDistrict) {
            district = foundDistrict;
          }
        }
        
        let streetAddress = '';
        if (address.road) {
          streetAddress = address.road;
          if (address.house_number) {
            streetAddress += ' ' + address.house_number;
          }
        } else {
          streetAddress = result.display_name.split(',')[0] || searchInput;
        }
        
        updateData({
          addressText: streetAddress,
          city: district,
          stateRegion: address.state || 'Lima',
          country: address.country || 'Perú',
          postalCode: address.postcode || '',
        });
      } else {
        alert('No se encontró la dirección. Intenta con: "Av. Larco, Miraflores" o solo el nombre del distrito.');
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      alert('Error al buscar la dirección. Intenta nuevamente.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMarkerDrag = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'addressText') {
      setSearchInput(value);
    }
    updateData({ [name]: value });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-dark-800">
          ¿Dónde está ubicado tu recinto?
        </h2>
        <p className="text-sm text-gray-dark-600">
          Tu dirección solo se compartirá con los huéspedes después de que confirmen una reserva.
        </p>
        <p className="text-sm text-blue-light-700 bg-blue-light-50 p-3 rounded-lg border border-blue-light-200">
          💡 Busca tu dirección o haz clic en el mapa para colocar el marcador. Puedes arrastrarlo para ajustar la ubicación exacta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700 md:col-span-2">
          Dirección (Calle y número)
          <div className="flex gap-2">
            <input
              type="text"
              name="addressText"
              value={searchInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Ej: Av. Larco 123, Miraflores"
              className="flex-grow rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
              disabled={isGeocoding}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isGeocoding || !searchInput.trim()}
              className="flex-shrink-0 inline-flex items-center justify-center rounded-2xl border-blue-light-600 bg-blue-vivid-600 border-2 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-vivid-700 hover:border-blue-light-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeocoding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Distrito
          <input
            type="text"
            name="city"
            value={data.city}
            onChange={handleChange}
            placeholder="Ej: Miraflores"
            className="rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 font-medium outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Estado / Región
          <input
            type="text"
            name="stateRegion"
            value={data.stateRegion}
            onChange={handleChange}
            placeholder="Ej: Lima"
            className="rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          País
          <input
            type="text"
            name="country"
            value={data.country}
            onChange={handleChange}
            placeholder="Ej: Peru"
            className="rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-blue-light-700">
          Código Postal
          <input
            type="text"
            name="postalCode"
            value={data.postalCode}
            onChange={handleChange}
            placeholder="Ej: 15074"
            className="rounded-2xl font-medium border-2 border-blue-light-300 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-lg font-medium text-gray-dark-600 mb-2">
          {isGeocoding ? 'Buscando ubicación...' : 'Haz clic en el mapa o arrastra el marcador:'}
        </p>

        {!isClient ? (
          <div className="w-full h-96 rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-light-600" />
          </div>
        ) : (
          <div className="w-full h-96 rounded-2xl border-2 border-blue-light-300 overflow-hidden relative">
            <MapContainer
              center={markerPosition}
              zoom={15}
              scrollWheelZoom={true}
              className="h-full w-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker 
                position={markerPosition} 
                onPositionChange={handleMarkerDrag}
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              <MapCenterController center={markerPosition} />
            </MapContainer>
            
            {isGeocoding && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
                <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-light-600" />
                  <span className="text-sm font-medium text-gray-dark-700">
                    Obteniendo dirección...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Nota:</strong> La geocodificación usa el servicio gratuito de OpenStreetMap (Nominatim). 
        Para producción, considera usar un servicio más robusto como Google Maps Geocoding API.
      </div>
    </div>
  );
}