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

          const binds = {
            p_email: email,
            p_name: name,
            p_provider: account.provider,
            p_provider_account_id: account.providerAccountId,
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

          const dbUserId = result?.outBinds?.out_user_id;

          if (dbUserId != null) {
            console.log("✅ Usuario autenticado con ID:", dbUserId);
            (user as any).dbUserId = dbUserId;
            return true;
          } else {
            console.error(
              "❌ El Stored Procedure no devolvió un ID de usuario."
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
     * 2. Se ejecuta después de 'signIn'.
     * Toma el ID de la BD (que adjuntamos) y lo guarda en el token de sesión.
     */
    async jwt({ token, user }) {
      if ((user as any)?.dbUserId) {
        token.id = (user as any).dbUserId;
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
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
