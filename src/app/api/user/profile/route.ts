import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { executeQuery, oracledb } from "@/src/lib/database";

export async function PUT(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener datos del request
    const body = await request.json();
    const { firstName, lastName, email, phone, dni, birthDate } = body;

    // 3. Validaciones básicas
    if (!firstName && !lastName && !email && !phone && !dni && !birthDate) {
      return NextResponse.json(
        { error: "Al menos un campo debe ser proporcionado para actualizar" },
        { status: 400 }
      );
    }

    // 4. Preparar fecha si viene (enviar como string para evitar problemas de timezone)
    let birthDateOracle = null;
    if (birthDate) {
      // Enviar la fecha directamente como string en formato YYYY-MM-DD
      // Oracle la interpretará como fecha local sin conversión de timezone
      birthDateOracle = birthDate; // '2005-07-19'

      console.log("📅 Fecha recibida del frontend:", birthDate);
      console.log("📅 Fecha enviada a Oracle (string):", birthDateOracle);
    }

    // 5. Ejecutar stored procedure usando executeQuery
    try {
      let query, params;

      if (birthDateOracle) {
        // Si hay fecha, usar TO_DATE para convertir el string a DATE
        query = `BEGIN
          USER_PKG.SP_UPDATE_USER_PROFILE(
            p_user_id => :user_id,
            p_first_name => :first_name,
            p_last_name => :last_name,
            p_email => :email,
            p_phone => :phone,
            p_dni => :dni,
            p_birth_date => TO_DATE(:birth_date, 'YYYY-MM-DD')
          );
        END;`;
        params = {
          user_id: parseInt(session.user.id),
          first_name: firstName || null,
          last_name: lastName || null,
          email: email || null,
          phone: phone || null,
          dni: dni || null,
          birth_date: birthDateOracle,
        };
      } else {
        // Si no hay fecha, usar la consulta original
        query = `BEGIN
          USER_PKG.SP_UPDATE_USER_PROFILE(
            p_user_id => :user_id,
            p_first_name => :first_name,
            p_last_name => :last_name,
            p_email => :email,
            p_phone => :phone,
            p_dni => :dni,
            p_birth_date => :birth_date
          );
        END;`;
        params = {
          user_id: parseInt(session.user.id),
          first_name: firstName || null,
          last_name: lastName || null,
          email: email || null,
          phone: phone || null,
          dni: dni || null,
          birth_date: null,
        };
      }

      console.log("🔧 Query SQL:", query);
      console.log("🔧 Parámetros:", params);

      await executeQuery(query, params);

      console.log("✅ Perfil actualizado exitosamente:", {
        userId: session.user.id,
        fieldsUpdated: Object.keys(body).filter(
          (key) => body[key] !== undefined
        ),
      });

      return NextResponse.json({
        success: true,
        message: "Perfil actualizado exitosamente",
        data: {
          userId: session.user.id,
          updatedFields: body,
        },
      });
    } catch (dbError: unknown) {
      console.error("❌ Error en base de datos:", dbError);

      // Manejar errores específicos de Oracle
      const oracleError = dbError as { errorNum?: number; message?: string };
      if (oracleError.errorNum) {
        switch (oracleError.errorNum) {
          case 1:
            return NextResponse.json(
              { error: "El email ya está en uso por otro usuario" },
              { status: 409 }
            );
          case 2290:
            return NextResponse.json(
              {
                error:
                  "Los datos proporcionados no cumplen con las validaciones",
              },
              { status: 400 }
            );
          default:
            return NextResponse.json(
              { error: "Error al actualizar el perfil en la base de datos" },
              { status: 500 }
            );
        }
      }

      throw dbError;
    }
  } catch (error: unknown) {
    console.error("❌ Error general en API:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// Método GET para obtener información del perfil actual usando SP
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      // Ejecutar stored procedure para obtener perfil usando executeQuery
      const result = await executeQuery(
        `BEGIN
          USER_PKG.SP_GET_USER_PROFILE(
            p_user_id => :user_id,
            p_first_name => :p_first_name,
            p_last_name => :p_last_name,
            p_email => :p_email,
            p_phone => :p_phone,
            p_dni => :p_dni,
            p_birth_date => :p_birth_date,
            p_created_at => :p_created_at,
            p_updated_at => :p_updated_at
          );
        END;`,
        {
          user_id: parseInt(session.user.id),
          p_first_name: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 100,
          },
          p_last_name: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 100,
          },
          p_email: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 255,
          },
          p_phone: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 20,
          },
          p_dni: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
          p_birth_date: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
          p_created_at: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
          p_updated_at: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
        }
      );

      if (!result.outBinds) {
        return NextResponse.json(
          { error: "No se encontraron datos del usuario" },
          { status: 404 }
        );
      }

      // Tipar correctamente los outBinds
      const outBinds = result.outBinds as {
        p_first_name?: string;
        p_last_name?: string;
        p_email?: string;
        p_phone?: string;
        p_dni?: string;
        p_birth_date?: Date;
        p_created_at?: Date;
        p_updated_at?: Date;
      };

      // Construir respuesta con los datos del SP
      const profileData = {
        firstName: outBinds.p_first_name || null,
        lastName: outBinds.p_last_name || null,
        email: outBinds.p_email || null,
        phone: outBinds.p_phone || null,
        dni: outBinds.p_dni || null,
        birthDate: outBinds.p_birth_date
          ? (() => {
              // Debug: ver qué fecha devuelve Oracle
              console.log("🔍 Fecha de Oracle:", outBinds.p_birth_date);
              console.log(
                "🔍 Fecha toString:",
                outBinds.p_birth_date.toString()
              );
              console.log("🔍 Fecha UTC:", outBinds.p_birth_date.toISOString());

              // Usar getUTCDate, getUTCMonth, getUTCFullYear para mantener la fecha original
              const year = outBinds.p_birth_date.getUTCFullYear();
              const month = String(
                outBinds.p_birth_date.getUTCMonth() + 1
              ).padStart(2, "0");
              const day = String(outBinds.p_birth_date.getUTCDate()).padStart(
                2,
                "0"
              );
              const formattedDate = `${year}-${month}-${day}`;

              console.log("🎯 Fecha formateada final:", formattedDate);
              return formattedDate;
            })()
          : null,
        createdAt: outBinds.p_created_at
          ? outBinds.p_created_at.toISOString()
          : "",
        updatedAt: outBinds.p_updated_at
          ? outBinds.p_updated_at.toISOString()
          : "",
      };
      console.log(
        "✅ Perfil obtenido exitosamente usando SP para usuario:",
        session.user.id
      );

      return NextResponse.json({
        success: true,
        data: profileData,
      });
    } catch (dbError: unknown) {
      console.error("❌ Error en SP obtener perfil:", dbError);

      // Manejar errores específicos de Oracle
      const oracleError = dbError as { errorNum?: number };
      if (oracleError.errorNum) {
        switch (oracleError.errorNum) {
          case 942:
            return NextResponse.json(
              { error: "Stored procedure no encontrado" },
              { status: 500 }
            );
          case 1403:
            return NextResponse.json(
              { error: "Usuario no encontrado" },
              { status: 404 }
            );
          default:
            return NextResponse.json(
              { error: "Error en la base de datos" },
              { status: 500 }
            );
        }
      }

      throw dbError;
    }
  } catch (error: unknown) {
    console.error("❌ Error general obteniendo perfil:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
