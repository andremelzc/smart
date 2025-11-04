import { NextResponse } from "next/server";
import { executeQuery } from "@/src/lib/database";

export async function GET() {
  try {
    console.log("🔍 Probando conexión a Oracle con consulta simple...");

    const ping = await executeQuery("SELECT 1 AS OK FROM DUAL");

    return NextResponse.json({
      success: true,
      message: "Conexión a Oracle exitosa",
      data: {
        ping: {
          metaData: ping.metaData,
          rows: ping.rows,
        },
        database: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          sid: process.env.DB_SID,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD ? "********" : "(vacío)"
        },
      },
    });
  } catch (error: unknown) {
    console.error("❌ Error de conexión:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        env: {
          DB_USERNAME: process.env.DB_USERNAME,
          DB_PASSWORD: process.env.DB_PASSWORD ? "********" : "(vacío)",
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT,
          DB_SID: process.env.DB_SID
        }
      },
      { status: 500 }
    );
  }
}
