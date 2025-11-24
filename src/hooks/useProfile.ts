import { useState, useEffect } from "react";
import { userService } from "@/src/services/user.service";
import type {
  UserProfileResponse,
  UserProfile,
} from "@/src/services/user.service";

interface UseProfileReturn {
  profileData: UserProfileResponse;
  loading: boolean;
  message: { type: "success" | "error"; text: string } | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UserProfile) => Promise<boolean>;
  setMessage: (
    message: { type: "success" | "error"; text: string } | null
  ) => void;
}

export function useProfile(): UseProfileReturn {
  const [profileData, setProfileData] = useState<UserProfileResponse>({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    dni: null,
    birthDate: null,
    createdAt: "",
    updatedAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();

      // getProfile retorna directamente UserProfileResponse, no ApiResponse
      setProfileData(response);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
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

  const updateProfile = async (data: UserProfile): Promise<boolean> => {
    try {
      const response = await userService.updateProfile(data);

      if (response.success) {
        setMessage({
          type: "success",
          text: response.message || "Perfil actualizado correctamente",
        });

        // Actualizar el estado local con los nuevos datos
        setProfileData((prev) => ({
          ...prev,
          ...data,
        }));

        return true;
      } else {
        setMessage({
          type: "error",
          text: response.error || "Error al actualizar el perfil",
        });
        return false;
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al conectar con el servidor";
      setMessage({
        type: "error",
        text: errorMessage,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profileData,
    loading,
    message,
    fetchProfile,
    updateProfile,
    setMessage,
  };
}
