export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { executeQuery, oracledb } from "@/src/lib/database";

/**
 * POST /api/user/become-host
 * Convierte al usuario autenticado en anfitrión llamando a USER_PKG.SP_BECOME_HOST
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = Number(token.id);

    // 2. Verificar que no sea ya host
    if (token.isHost) {
      return NextResponse.json(
        { success: false, error: "Ya eres anfitrión" },
        { status: 400 }
      );
    }

    // 3. Construir nombre calificado del SP
    const schema = process.env.DB_SCHEMA?.trim();
    const userPkg = process.env.DB_USER_PACKAGE?.trim() || "USER_PKG";
    let qualifiedName = `${userPkg}.SP_BECOME_HOST`;
    if (schema && schema.length > 0) {
      qualifiedName = `${schema}.${qualifiedName}`;
    }

    // 4. Llamar al SP
    const sql = `BEGIN ${qualifiedName}(:p_user_id, :out_host_id); END;`;
    const binds = {
      p_user_id: userId,
      out_host_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    } as const;

    console.log(`📤 Llamando a ${qualifiedName} para userId:`, userId);
    const result = (await executeQuery(sql, binds)) as {
      outBinds?: { out_host_id?: number };
    };
    const hostId = result?.outBinds?.out_host_id;

    if (hostId == null) {
      console.error("❌ SP no devolvió host_id");
      return NextResponse.json(
        { success: false, error: "No se pudo crear el registro de anfitrión" },
        { status: 500 }
      );
    }

    console.log("✅ Usuario convertido a anfitrión, hostId:", hostId);

    // 5. Nota: El usuario debe volver a iniciar sesión o refrescar el token
    // para que isHost se actualice en la sesión.
    // Opcionalmente puedes forzar un sign-out aquí o devolver un flag.

    return NextResponse.json({
      success: true,
      message:
        "Ahora eres anfitrión. Por favor, vuelve a iniciar sesión para actualizar tu sesión.",
      hostId,
    });
  } catch (error: unknown) {
    console.error("💥 Error en /api/user/become-host:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la solicitud",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
