// Obligatorio para que el driver nativo de Oracle funcione
export const runtime = "nodejs";

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// Importamos nuestras funciones de base de datos
import { executeQuery, oracledb } from "@/src/lib/database";
import { authStoredProcedures } from "@/src/services/auth-sp.service";

// Tipos específicos para NextAuth
interface NextAuthAccount {
  provider: string;
  providerAccountId?: string;
  type?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

interface NextAuthProfile {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

interface OracleResult {
  rows?: unknown[][];
  outBinds?: Record<string, unknown>;
}

interface DatabaseUser {
  USER_ID: number;
  EMAIL: string;
  NAME: string;
  AVATAR_URL?: string;
  IS_HOST?: number;
  IS_VERIFIED?: number;
  CREATED_AT?: Date | string;
}

// Tipo extendido que incluye todas las propiedades adicionales
interface ExtendedUser extends DatabaseUser {
  id?: string;
  dbUserId?: number;
  dbIdentityId?: number;
  dbRoles?: string[];
  dbIsTenant?: boolean;
  dbIsHost?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const result = await authStoredProcedures.validateCredentials(
            credentials.email,
            credentials.password
          );

          if (!result.success || !result.userData) {
            throw new Error(
              authStoredProcedures.getErrorMessage(
                result.errorCode || "INVALID_CREDENTIALS"
              )
            );
          }

          const userData = result.userData;

          return {
            id: userData.userId.toString(),
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`.trim(),
            dbUserId: userData.userId,
            // Agregar otros campos que necesites
          };
        } catch (error) {
          console.error("Error in credentials authorization:", error);

          if (error instanceof Error) {
            throw error;
          }

          throw new Error("Error interno del servidor");
        }
      },
    }),
  ],

  session: {
    // Usar JWT para las sesiones es lo más simple para este flujo
    strategy: "jwt",
  },

  callbacks: {
    /**
     * 1. Se ejecuta al iniciar sesión (una sola vez)
     * Aquí llamamos al Stored Procedure para crear/buscar al usuario.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          const email = user.email;
          const name = user.name || "";

          if (!email) {
            console.error("❌ No se pudo obtener el email de Google.");
            return false;
          }

          // Dividir el nombre en first_name y last_name aquí (más limpio)
          const safeName = name && name.trim() ? name.trim() : "Usuario";
          const nameParts = safeName.split(" ");
          const firstName = nameParts[0] || "Usuario";
          const lastName =
            nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

          const sql = `
        BEGIN 
          AUTH_PKG.SP_FIND_OR_CREATE_USER_OAUTH(
            :p_email, 
            :p_first_name,
            :p_last_name,
            :p_provider, 
            :p_provider_account_id, 
            :out_user_id,
            :out_identity_id
          ); 
        END;`;

          // Aseguramos providerAccountId (fallback a profile.sub)
          const typedAccount = account as NextAuthAccount;
          const typedProfile = profile as NextAuthProfile;
          const providerAccountId =
            typedAccount?.providerAccountId ?? typedProfile?.sub ?? "";
          const binds = {
            p_email: email,
            p_first_name: firstName,
            p_last_name: lastName,
            p_provider: account.provider,
            p_provider_account_id: providerAccountId,
            out_user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_identity_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          };

          console.log("📤 Enviando a Oracle:", {
            email,
            firstName,
            lastName,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          const result = (await executeQuery(sql, binds)) as OracleResult;

          console.log(
            "📥 Respuesta completa de Oracle:",
            JSON.stringify(result, null, 2)
          );
          console.log("🔍 outBinds:", result?.outBinds);
          console.log("🔍 out_user_id:", result?.outBinds?.out_user_id);
          console.log("🔍 out_identity_id:", result?.outBinds?.out_identity_id);

          const dbUserId = result?.outBinds?.out_user_id as number;
          const dbIdentityId = result?.outBinds?.out_identity_id as number;

          if (dbUserId != null && dbIdentityId != null) {
            console.log("✅ Usuario autenticado con IDs:", {
              dbUserId,
              dbIdentityId,
            });

            // Usar el tipo extendido
            const extendedUser = user as ExtendedUser;
            extendedUser.dbUserId = dbUserId;
            extendedUser.dbIdentityId = dbIdentityId;

            // Obtener roles del usuario desde USER_PKG.SP_GET_USER_ROLES
            try {
              const schema = process.env.DB_SCHEMA?.trim();
              const userPkg = process.env.DB_USER_PACKAGE?.trim() || "USER_PKG";
              let qualifiedName = `${userPkg}.SP_GET_USER_ROLES`;
              if (schema && schema.length > 0) {
                qualifiedName = `${schema}.${qualifiedName}`;
              }

              const rolesSql = `BEGIN ${qualifiedName}(:p_user_id, :out_is_tenant, :out_is_host); END;`;
              const rolesBinds = {
                p_user_id: dbUserId,
                out_is_tenant: {
                  dir: oracledb.BIND_OUT,
                  type: oracledb.NUMBER,
                },
                out_is_host: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              };

              const rolesRes = (await executeQuery(
                rolesSql,
                rolesBinds
              )) as OracleResult;
              const isTenant = Number(rolesRes?.outBinds?.out_is_tenant) === 1;
              const isHost = Number(rolesRes?.outBinds?.out_is_host) === 1;

              extendedUser.dbIsTenant = isTenant;
              extendedUser.dbIsHost = isHost;
              extendedUser.dbRoles = [
                ...(isTenant ? ["tenant"] : []),
                ...(isHost ? ["host"] : []),
              ];
              console.log("👤 Roles asignados:", extendedUser.dbRoles);
            } catch (rolesErr) {
              console.error(
                "⚠️ No se pudieron obtener los roles del usuario:",
                rolesErr
              );
              // No bloqueamos el login por roles
            }
            return true;
          } else {
            console.error(
              "❌ El Stored Procedure no devolvió ambos OUT (user e identity).",
              {
                dbUserId,
                dbIdentityId,
              }
            );
            return false;
          }
        } catch (err) {
          console.error("💥 Error al ejecutar el Stored Procedure:", err);
          return false;
        }
      }
      return true;
    },

    /**
     * 2. Se ejecuta después de 'signIn' y también en actualizaciones de sesión.
     * Toma el ID de la BD y actualiza el token de sesión.
     */
    async jwt({ token, user, trigger }) {
      // En signIn inicial, configuramos el token básico
      if (trigger === "signIn" && user) {
        // Guardamos el USER_ID en el token
        const typedUser = user as ExtendedUser;
        if (typedUser?.dbUserId) {
          token.id = typedUser.dbUserId;
        } else if (user.id) {
          // Para Credentials, el ID ya viene en user.id
          token.id = user.id;
        }

        // Si tenemos el IDENTITY_ID (viene de OAuth o podríamos obtenerlo de Credentials)
        const identityId = typedUser?.dbIdentityId; // ID de USER_AUTH_IDENTITIES

        if (identityId) {
          token.identityId = identityId; // Guardamos identityId en el token

          // --- AQUÍ LLAMAMOS AL SP_UPDATE_LAST_LOGIN (ENFOQUE FLEXIBLE) ---
          try {
            console.log(
              `🔄 Actualizando last login para identityId: ${identityId}`
            );
            const sqlUpdate = `BEGIN AUTH_PKG.SP_UPDATE_LAST_LOGIN(:p_identity_id); END;`;
            const bindsUpdate = { p_identity_id: identityId };
            await executeQuery(sqlUpdate, bindsUpdate);
            console.log("✅ Last login actualizado.");
          } catch (updateErr) {
            // *** LA CLAVE DE LA FLEXIBILIDAD ***
            // Si la actualización falla, SOLO logueamos el error,
            // pero NO retornamos false ni lanzamos una excepción.
            // El flujo continúa y el token se crea igual.
            console.error(
              "💥 Error al actualizar last login (no bloqueante):",
              updateErr
            );
          }
          // ---------------------------------------------
        } else {
          console.warn(
            "⚠️ No se encontró identityId para actualizar last login."
          );
        }

        // Persistir roles en el token
        const userWithRoles = user as ExtendedUser;
        if (userWithRoles?.dbRoles) {
          (token as Record<string, unknown>).roles = userWithRoles.dbRoles;
        }
        if (typeof userWithRoles?.dbIsTenant !== "undefined") {
          (token as Record<string, unknown>).isTenant =
            userWithRoles.dbIsTenant;
        }
        if (typeof userWithRoles?.dbIsHost !== "undefined") {
          (token as Record<string, unknown>).isHost = userWithRoles.dbIsHost;
        }
      }

      // Si es una actualización de sesión (update trigger), refrescamos los datos del usuario
      if (trigger === "update" && token.id) {
        try {
          console.log("🔄 Actualizando datos de usuario en token para ID:", token.id);
          
          // Consultamos la BD para obtener los datos actualizados del usuario
          const getUserSql = `
            SELECT 
              u.USER_ID,
              u.EMAIL,
              u.FIRST_NAME || ' ' || u.LAST_NAME AS NAME,
              CASE WHEN h.HOST_ID IS NOT NULL THEN 1 ELSE 0 END AS IS_HOST,
              u.CREATED_AT
            FROM USERS u
            LEFT JOIN HOSTS h ON u.USER_ID = h.HOST_ID
            WHERE u.USER_ID = :userId
          `;
          
          const result = await executeQuery(getUserSql, { userId: token.id }) as OracleResult;
          console.log("📊 Resultado de consulta SQL:", result);
          
          if (result.rows && result.rows.length > 0) {
            const userData = (result.rows[0] as unknown) as Record<string, unknown>;
            console.log("📦 userData row:", userData);
            
            // IS_HOST está en el índice 4 (0: USER_ID, 1: EMAIL, 2: NAME, 3: AVATAR_URL, 4: IS_HOST, 5: IS_VERIFIED, 6: CREATED_AT)
            const isHost = Number(userData.IS_HOST) === 1;
            
            console.log("✅ Datos actualizados del usuario:", { userId: token.id, isHost, rawValue: userData[4] });
            
            // Actualizamos el token con los nuevos valores
            (token as Record<string, unknown>).isHost = isHost;
            (token as Record<string, unknown>).isTenant = true; // Asumimos que todos son tenants
          } else {
            console.warn("⚠️ No se encontraron datos para el usuario:", token.id);
          }
        } catch (error) {
          console.error("❌ Error actualizando datos de usuario:", error);
          // No bloqueamos, continuamos con el token existente
        }
      }

      return token;
    },

    /**
     * 3. Se ejecuta cada vez que se lee la sesión.
     * Toma el ID del token y lo pasa a la sesión del cliente.
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // Exponer roles a la sesión del cliente
        const extendedUser = session.user as Record<string, unknown>;
        const extendedToken = token as Record<string, unknown>;
        extendedUser.roles = extendedToken.roles ?? [];
        extendedUser.isTenant = extendedToken.isTenant ?? false;
        extendedUser.isHost = extendedToken.isHost ?? false;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
