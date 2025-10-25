/**
 * Servicio de operaciones de usuario en cliente
 */
export const userService = {
  /**
   * Convierte al usuario autenticado en anfitrión
   * @returns Promise con el resultado de la operación
   */
  becomeHost: async () => {
    try {
      const response = await fetch('/api/user/become-host', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al convertirse en anfitrión');
      }

      return {
        success: true,
        hostId: data.hostId,
        message: data.message,
      };
    } catch (error: any) {
      console.error('Error en becomeHost:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido',
      };
    }
  },
};
