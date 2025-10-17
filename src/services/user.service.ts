import { Repository } from "typeorm";
import { UserAuthIdentities } from "@/src/entities/UserAuthIdentities";
import { Users } from "@/src/entities/Users";
import { getDataSource } from "@/src/lib/database";

/*
 * Interfaz para el resultado de búsqueda de usuario.
 */
export interface FindUserResult {
  success: boolean;
  user?: Users;
  authIdentity?: UserAuthIdentities;
  error?: { code: string; message: string };
}

/**
 * Valida el formato básico de email.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida el estado del usuario para login.
 */
function validateUserForLogin(
  user: Users,
  auth: UserAuthIdentities
): { code: string; message: string } | null {
  // ... (Toda tu lógica de validación se mantiene exactamente igual aquí)
  if (user.status === "suspended") {
    return { code: "ACCOUNT_SUSPENDED", message: "Cuenta suspendida." };
  }
  if (auth.emailVerified === 0) {
    return { code: "EMAIL_NOT_VERIFIED", message: "Email no verificado." };
  }
  // ... etc.
  return null;
}

/**
 * Función principal: Busca y valida un usuario por email en UNA SOLA CONSULTA.
 */
export async function findAndValidateUserByEmail(
  email: string,
  provider: string = "local"
): Promise<FindUserResult> {
  // 1. Validación de entrada
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: { code: "INVALID_EMAIL", message: "Formato de email inválido" },
    };
  }

  try {
    const dataSource = await getDataSource();
    const authRepo = dataSource.getRepository(UserAuthIdentities);

    // 2. UNA SOLA CONSULTA EFICIENTE A LA BASE DE DATOS
    // .leftJoinAndSelect le dice a TypeORM: "Tráeme la identidad Y también
    // los datos del usuario relacionado en la misma consulta".
    const authIdentity = await authRepo.findOne({
      where: {
        email: email.toLowerCase().trim(),
        provider: provider,
      },
      relations: ["user"], // <-- La magia para traer el usuario relacionado
    });

    // 3. Verificaciones de negocio
    if (!authIdentity || !authIdentity.user) {
      return {
        success: false,
        error: { code: "USER_NOT_FOUND", message: "Credenciales inválidas" },
      };
    }

    const validationError = validateUserForLogin(
      authIdentity.user,
      authIdentity
    );
    if (validationError) {
      return { success: false, error: validationError };
    }

    // 4. Éxito
    return {
      success: true,
      user: authIdentity.user,
      authIdentity,
    };
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
    };
  }
}

/**
 * Actualiza la fecha del último login
 */
export async function updateLastLogin(identityId: number): Promise<void> {
  try {
    const dataSource = await getDataSource();
    const authRepo = dataSource.getRepository(UserAuthIdentities);
    await authRepo.update(identityId, { lastLoginAt: new Date() });
  } catch (error) {
    console.error("Error al actualizar último login:", error);
  }
}
