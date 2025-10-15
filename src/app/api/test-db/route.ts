import { NextResponse } from "next/server";
import { getDataSource } from "@/src/lib/database";
import { Users } from "@/src/entities/Users";
import { UserAuthIdentities } from "@/src/entities/UserAuthIdentities";

export async function GET() {
  try {
    console.log("🔍 Intentando conectar a Oracle...");
    
    // Obtener la conexión
    const dataSource = await getDataSource();
    
    console.log("✅ Conexión establecida");

    // Probar queries básicas
    const userRepository = dataSource.getRepository(Users);
    const authRepository = dataSource.getRepository(UserAuthIdentities);

    const userCount = await userRepository.count();
    const authCount = await authRepository.count();

    // Obtener algunos usuarios de muestra (máximo 3)
    const sampleUsers = await userRepository.find({
      take: 3,
      select: ["userId", "email", "firstName", "lastName", "createdAt"],
    });

    return NextResponse.json({
      success: true,
      message: "Conexión a Oracle exitosa",
      data: {
        totalUsers: userCount,
        totalAuthIdentities: authCount,
        sampleUsers,
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
