import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

// Type for Oracle CLOB handling
interface OracleClob {
  getData(): Promise<Buffer>;
}

// GET - Obtener perfil público del usuario
export async function GET() {
  let connection: oracledb.Connection | null = null;

  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    connection = await getConnection();

    // Ejecutar el stored procedure
    const result = await connection.execute(
      `BEGIN
         USER_PKG.SP_GET_PUBLIC_USER_PROFILE(
           :p_user_id,
           :p_profile_cursor,
           :p_preferences_cursor
         );
       END;`,
      {
        p_user_id: userId,
        p_profile_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        p_preferences_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const outBinds = result.outBinds as {
      p_profile_cursor?: oracledb.ResultSet<unknown>;
      p_preferences_cursor?: oracledb.ResultSet<unknown>;
    };

    // Procesar cursor de perfil
    let profileData = null;
    if (outBinds.p_profile_cursor) {
      const profileRows = await outBinds.p_profile_cursor.getRows(1);
      if (profileRows.length > 0) {
        const row = profileRows[0] as unknown[];

        // Procesar CLOB en la biografía
        let bio = null;
        if (row[2] && typeof row[2] === "object" && "getData" in row[2]) {
          try {
            const bioBuffer = await (row[2] as OracleClob).getData();
            bio = bioBuffer.toString();
          } catch (error) {
            console.error("Error reading bio CLOB:", error);
            bio = null;
          }
        } else {
          bio = row[2] as string | null;
        }

        profileData = {
          firstName: row[0] as string | null,
          lastName: row[1] as string | null,
          bio: bio,
        };
      }
      await outBinds.p_profile_cursor.close();
    }

    // Procesar cursor de preferencias
    const preferences: Array<{
      preferenceId: number;
      code: string;
      name: string;
      description: string;
      valueText: string | null;
    }> = [];

    if (outBinds.p_preferences_cursor) {
      const cursor = outBinds.p_preferences_cursor;
      let row: unknown[] | undefined;

      while ((row = (await cursor.getRow()) as unknown[] | undefined)) {
        // Procesar CLOB en la descripción
        let description = null;
        if (row[3] && typeof row[3] === "object" && "getData" in row[3]) {
          try {
            const descBuffer = await (row[3] as OracleClob).getData();
            description = descBuffer.toString();
          } catch {
            description = "Error reading description";
          }
        } else {
          description = row[3] as string;
        }

        preferences.push({
          preferenceId: row[0] as number,
          code: row[1] as string,
          name: row[2] as string,
          description: description,
          valueText: row[4] as string | null,
        });
      }

      await cursor.close();
    }

    console.log("✅ Profile GET API Response:", {
      profile: profileData,
      preferences: preferences,
      totalPreferences: preferences.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: profileData,
        preferences: preferences,
      },
    });
  } catch (error) {
    console.error("Error en SP_GET_PUBLIC_USER_PROFILE:", error);

    if (error && typeof error === "object" && "errorNum" in error) {
      const oracleError = error as { errorNum: number; message: string };
      console.error("Oracle Error:", oracleError.errorNum, oracleError.message);

      return NextResponse.json(
        { error: "Error en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError);
      }
    }
  }
}

// PUT - Actualizar perfil público del usuario
export async function PUT(request: NextRequest) {
  let connection: oracledb.Connection | null = null;

  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Obtener datos del body
    const body = await request.json();

    console.log("📥 Raw body received:", JSON.stringify(body, null, 2));

    const {
      biography = "", // Valor por defecto si no viene
      interests = null,
      pets = null,
      location = null,
      work = null,
      language = null,
      school = null,
    } = body;

    console.log("📥 Processed data:", {
      biography: biography ? `${biography.substring(0, 50)}...` : "(empty)",
      biographyLength: biography?.length || 0,
      interests,
      pets,
      location,
      work,
      language,
      school,
    });

    connection = await getConnection();

    console.log("📝 Updating profile for user:", userId);

    // Ejecutar el stored procedure de actualización
    await connection.execute(
      `BEGIN
         USER_PKG.SP_UPDATE_PUBLIC_USER_PROFILE(
           p_user_id => :p_user_id,
           p_biography => :p_biography,
           p_interests => :p_interests,
           p_pets => :p_pets,
           p_location => :p_location,
           p_work => :p_work,
           p_language => :p_language,
           p_school => :p_school
         );
       END;`,
      {
        p_user_id: userId,
        p_biography: {
          val: biography || "",
          type: oracledb.CLOB,
          dir: oracledb.BIND_IN,
        },
        p_interests: interests || null,
        p_pets: pets || null,
        p_location: location || null,
        p_work: work || null,
        p_language: language || null,
        p_school: school || null,
      },
      {
        autoCommit: false, // El SP maneja su propio COMMIT
      }
    );

    console.log("✅ Profile updated successfully for user:", userId);

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en SP_UPDATE_PUBLIC_USER_PROFILE:", error);

    // Manejar errores de Oracle específicos
    if (error && typeof error === "object" && "errorNum" in error) {
      const oracleError = error as { errorNum: number; message: string };
      console.error("Oracle Error:", oracleError.errorNum, oracleError.message);

      // Errores comunes de Oracle
      if (oracleError.errorNum === 1) {
        return NextResponse.json(
          { error: "Violación de restricción única" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "Error en la base de datos",
          details: oracleError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError);
      }
    }
  }
}
