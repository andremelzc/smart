// Types
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dni?: string;
  birthDate?: string; // formato YYYY-MM-DD
}

export interface UserProfileResponse {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

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
      const response = await fetch("/api/user/become-host", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al convertirse en anfitrión");
      }

      return {
        success: true,
        hostId: data.hostId,
        message: data.message,
      };
    } catch (error: any) {
      console.error("Error en becomeHost:", error);
      return {
        success: false,
        error: error.message || "Error desconocido",
      };
    }
  },

  /**
   * Actualiza el perfil del usuario
   * @param profileData - Datos del perfil a actualizar
   * @returns Promise con la respuesta de la API
   */
  updateProfile: async (profileData: UserProfile): Promise<ApiResponse> => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          dni: profileData.dni,
          birthDate: profileData.birthDate,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil");
      }

      return data;
    } catch (error: any) {
      console.error("❌ Error en updateProfile:", error);
      throw new Error(error.message || "Error de conexión");
    }
  },

  /**
   * Obtiene el perfil actual del usuario
   * @returns Promise con los datos del perfil
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse<UserProfileResponse> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener el perfil");
      }

      return data.data!;
    } catch (error: any) {
      console.error("❌ Error en getProfile:", error);
      throw new Error(error.message || "Error de conexión");
    }
  },

  /**
   * Actualiza un campo específico del perfil
   * @param field - Campo a actualizar
   * @param value - Nuevo valor
   * @returns Promise con la respuesta
   */
  updateField: async (
    field: keyof UserProfile,
    value: string
  ): Promise<ApiResponse> => {
    const profileData: UserProfile = {
      [field]: value,
    };

    return userService.updateProfile(profileData);
  },

  // Validaciones
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone: string): boolean => {
    // Formato peruano: +51 999 999 999 o 999999999
    const phoneRegex = /^(\+51\s?)?[9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  validateDni: (dni: string): boolean => {
    // DNI peruano: 8 dígitos
    const dniRegex = /^[0-9]{8}$/;
    return dniRegex.test(dni);
  },

  validateBirthDate: (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 120,
      today.getMonth(),
      today.getDate()
    );

    return birthDate <= today && birthDate >= minDate;
  },
};
