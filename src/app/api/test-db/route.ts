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
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error de conexión:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}
