// Obligatorio para que el driver nativo de Oracle funcione
export const runtime = "nodejs";

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Importamos nuestras funciones de base de datos
import { executeQuery, oracledb } from "@/src/lib/database";

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
          const name = user.name;

          if (!email) {
            console.error("❌ No se pudo obtener el email de Google.");
            return false;
          }

          const sql = `
        BEGIN 
          AUTH_PKG.SP_FIND_OR_CREATE_USER_OAUTH(
            :p_email, 
            :p_name, 
            :p_provider, 
            :p_provider_account_id, 
            :out_user_id,
            :out_identity_id
          ); 
        END;`;

          // Aseguramos providerAccountId (fallback a profile.sub)
          const providerAccountId = (account as any)?.providerAccountId ?? (profile as any)?.sub ?? "";
          const binds = {
            p_email: email,
            p_name: name,
            p_provider: account.provider,
            p_provider_account_id: providerAccountId,
            out_user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_identity_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          };

          console.log("📤 Enviando a Oracle:", {
            email,
            name,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });

          const result: any = await executeQuery(sql, binds);

          console.log(
            "📥 Respuesta completa de Oracle:",
            JSON.stringify(result, null, 2)
          );
          console.log("🔍 outBinds:", result?.outBinds);
          console.log("🔍 out_user_id:", result?.outBinds?.out_user_id);
          console.log("🔍 out_identity_id:", result?.outBinds?.out_identity_id);

          const dbUserId = result?.outBinds?.out_user_id;
          const dbIdentityId = result?.outBinds?.out_identity_id;

          if (dbUserId != null && dbIdentityId != null) {
            console.log("✅ Usuario autenticado con IDs:", { dbUserId, dbIdentityId });
            (user as any).dbUserId = dbUserId;
            (user as any).dbIdentityId = dbIdentityId;

            // Obtener roles del usuario desde USER_PKG.SP_GET_USER_ROLES
            try {
              const schema = process.env.DB_SCHEMA?.trim();
              const userPkg = process.env.DB_USER_PACKAGE?.trim() || 'USER_PKG';
              let qualifiedName = `${userPkg}.SP_GET_USER_ROLES`;
              if (schema && schema.length > 0) {
                qualifiedName = `${schema}.${qualifiedName}`;
              }

              const rolesSql = `BEGIN ${qualifiedName}(:p_user_id, :out_is_tenant, :out_is_host); END;`;
              const rolesBinds = {
                p_user_id: dbUserId,
                out_is_tenant: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                out_is_host: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
              } as const;

              const rolesRes: any = await executeQuery(rolesSql, rolesBinds);
              const isTenant = Number(rolesRes?.outBinds?.out_is_tenant) === 1;
              const isHost = Number(rolesRes?.outBinds?.out_is_host) === 1;

              (user as any).dbIsTenant = isTenant;
              (user as any).dbIsHost = isHost;
              (user as any).dbRoles = [
                ...(isTenant ? ['tenant'] : []),
                ...(isHost ? ['host'] : []),
              ];
              console.log('👤 Roles asignados:', (user as any).dbRoles);
            } catch (rolesErr) {
              console.error('⚠️ No se pudieron obtener los roles del usuario:', rolesErr);
              // No bloqueamos el login por roles
            }
            return true;
          } else {
            console.error("❌ El Stored Procedure no devolvió ambos OUT (user e identity).", {
              dbUserId,
              dbIdentityId,
            });
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
     * 2. Se ejecuta después de 'signIn'.
     * Toma el ID de la BD (que adjuntamos) y lo guarda en el token de sesión.
     */
    async jwt({ token, user, trigger, account }) {
      // Solo hacemos esto la primera vez que se crea el token (al iniciar sesión)
      if (trigger === "signIn" && user) {
        // Guardamos el USER_ID en el token
        if ((user as any)?.dbUserId) {
          token.id = (user as any).dbUserId;
        } else if (user.id) {
          // Para Credentials, el ID ya viene en user.id
          token.id = user.id;
        }

        // Si tenemos el IDENTITY_ID (viene de OAuth o podríamos obtenerlo de Credentials)
        const identityId = (user as any)?.dbIdentityId; // ID de USER_AUTH_IDENTITIES

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
        if ((user as any)?.dbRoles) {
          (token as any).roles = (user as any).dbRoles as string[];
        }
        if (typeof (user as any)?.dbIsTenant !== 'undefined') {
          (token as any).isTenant = (user as any).dbIsTenant as boolean;
        }
        if (typeof (user as any)?.dbIsHost !== 'undefined') {
          (token as any).isHost = (user as any).dbIsHost as boolean;
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
        (session.user as any).roles = (token as any).roles ?? [];
        (session.user as any).isTenant = (token as any).isTenant ?? false;
        (session.user as any).isHost = (token as any).isHost ?? false;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
