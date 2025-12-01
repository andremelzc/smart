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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PublicUserProfile {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  bio: string | null;
  interests: string[];
  languages: string[];
  location: string | null;
  isHost: boolean;
  hostSince: string | null;
  verificationStatus: "none" | "phone" | "email" | "government_id" | "full";
  responseTime: string | null; // "within an hour", "within a few hours", etc.
  responseRate: number | null; // percentage 0-100
  createdAt: string;
}

export interface UserPreference {
  preferenceId: number;
  code: string;
  name: string;
  description: string;
  valueText: string | null;
}

export interface UserProfileDetails {
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    averageRating?: number | null;
    totalBookings?: number | null;
  } | null;
  preferences: UserPreference[];
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
    console.log("🌐 userService.becomeHost - Iniciando llamada a API...");
    try {
      console.log("📡 Haciendo fetch a /api/user/become-host");
      const response = await fetch("/api/user/become-host", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status, response.statusText);
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        console.error("❌ Response not OK:", data.error);
        throw new Error(data.error || "Error al convertirse en anfitrión");
      }

      console.log("✅ becomeHost exitoso:", data);
      return {
        success: true,
        hostId: data.hostId,
        message: data.message,
      };
    } catch (error: unknown) {
      console.error("💥 Error en becomeHost:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      return {
        success: false,
        error: errorMessage,
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
    } catch (error: unknown) {
      console.error("❌ Error en updateProfile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      console.error("❌ Error en getProfile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el perfil público de cualquier usuario por ID
   * @param userId - ID del usuario a consultar
   * @returns Promise con los datos públicos del perfil
   */
  getPublicProfile: async (userId: number): Promise<PublicUserProfile> => {
    try {
      const response = await fetch(`/api/user/public-profile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse<PublicUserProfile> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener el perfil público");
      }

      return data.data!;
    } catch (error: unknown) {
      console.error("❌ Error en getPublicProfile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene los detalles completos del perfil (perfil + preferencias) usando SP
   * @returns Promise con perfil y preferencias del usuario autenticado
   */
  getProfileDetails: async (): Promise<UserProfileDetails> => {
    try {
      const response = await fetch("/api/user/profile-details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse<UserProfileDetails> = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error al obtener los detalles del perfil"
        );
      }

      return data.data!;
    } catch (error: unknown) {
      console.error("❌ Error en getProfileDetails:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza los detalles del perfil (bio + preferencias) usando SP
   * @param bio - Nueva biografía
   * @param preferences - Array de preferencias con código y valor
   * @returns Promise con la respuesta de la API
   */
  updateProfileDetails: async (
    bio: string,
    preferences: Array<{ code: string; value: string }>
  ): Promise<ApiResponse> => {
    try {
      // Validar que la bio no sea vacía (opcional, según tu lógica de negocio)
      if (!bio || bio.trim() === "") {
        throw new Error("La biografía es requerida");
      }

      // Convertir el array de preferencias al formato que espera el API
      const preferencesMap: Record<string, string> = {};
      preferences.forEach((pref) => {
        // Convertir código a minúsculas para el API
        preferencesMap[pref.code.toLowerCase()] = pref.value || "";
      });

      console.log("📤 Sending to API:", {
        biography: bio.substring(0, 50) + "...",
        ...preferencesMap,
      });

      const response = await fetch("/api/user/profile-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          biography: bio, // Cambiar 'bio' a 'biography'
          interests: preferencesMap["interests"] || null,
          pets: preferencesMap["pets"] || null,
          location: preferencesMap["location"] || null,
          work: preferencesMap["work"] || null,
          language: preferencesMap["language"] || null,
          school: preferencesMap["school"] || null,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error al actualizar los detalles del perfil"
        );
      }

      return data;
    } catch (error: unknown) {
      console.error("❌ Error en updateProfileDetails:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },
  /**
   * Actualiza un campo específico del perfil
   * @param field - Campo a actualizar
   * @param value - Nuevo valor
   * @returns Promise con la respuesta
   */ updateField: async (
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
