'use server';

import { PropertyService } from '@/src/services/property.service';

/**
 * Server Action para obtener las propiedades del host.
 */
export async function getHostProperties(hostId: number) {
  // DEBUG: Ver qué ID llega al servidor
  console.log(`🟢 [Server Action] getHostProperties invocado con hostId:`, hostId);
  
  try {
    const properties = await PropertyService.getPropertyByHost(hostId);
    
    // DEBUG: Ver qué devolvió el servicio antes de enviarlo al cliente
    console.log(`🟢 [Server Action] El servicio devolvió ${properties.length} propiedades.`);
    if (properties.length > 0) {
      console.log(`🟢 [Server Action] Ejemplo de primera propiedad:`, JSON.stringify(properties[0], null, 2));
    }
    
    return properties;
  } catch (error) {
    console.error('🔴 [Server Action] Error crítico:', error);
    return [];
  }
}