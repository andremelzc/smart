import { useState, useEffect } from "react";
import { userService } from "@/src/services/user.service";
import type { UserPreference } from "@/src/services/user.service";

interface UseProfileDetailsReturn {
  profileData: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    averageRating?: number | null;
    totalBookings?: number | null;
  } | null;
  preferences: UserPreference[];
  loading: boolean;
  message: { type: "success" | "error"; text: string } | null;
  fetchProfileDetails: () => Promise<void>;
  updateProfileDetails: (
    bio: string,
    preferences: Array<{ code: string; value: string }>
  ) => Promise<boolean>;
  setMessage: (
    message: { type: "success" | "error"; text: string } | null
  ) => void;
}

export function useProfileDetails(): UseProfileDetailsReturn {
  const [profileData, setProfileData] = useState<{
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    averageRating?: number | null;
    totalBookings?: number | null;
  } | null>(null);

  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfileDetails();

      setProfileData(response.profile);
      setPreferences(response.preferences);

      console.log("Perfil obtenido:", response);
    } catch (error: unknown) {
      console.error("Error fetching profile details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfileDetails = async (
    bio: string,
    preferences: Array<{ code: string; value: string }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      await userService.updateProfileDetails(bio, preferences);

      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente",
      });

      // Recargar los datos después de actualizar
      await fetchProfileDetails();

      return true;
    } catch (error: unknown) {
      console.error("Error updating profile details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil";
      setMessage({
        type: "error",
        text: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  return {
    profileData,
    preferences,
    loading,
    message,
    fetchProfileDetails,
    updateProfileDetails,
    setMessage,
  };
}
