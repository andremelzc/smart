import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authStoredProcedures } from "@/src/services/auth-sp.service";

// Schema de validación para el registro
const registerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").trim(),
  lastName: z.string().min(1, "El apellido es obligatorio").trim(),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    // Parsear y validar el body de la request
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { firstName, lastName, email, password } = validatedData;

    // Llamar al stored procedure de registro a través del servicio
    console.log("Intentando registrar usuario:", {
      email,
      firstName,
      lastName,
    });

    const result = await authStoredProcedures.registerWithCredentials(
      email,
      password,
      firstName,
      lastName
    );

    console.log("Resultado del servicio de registro:", result);

    if (!result.success || !result.userId) {
      const errorMessage = authStoredProcedures.getErrorMessage(
        result.errorCode || "UNKNOWN_ERROR"
      );
      console.error("Error en registro:", {
        errorCode: result.errorCode,
        errorMessage,
      });

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const newUserId = result.userId;

    // Respuesta exitosa (sin datos sensibles)
    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        user: {
          id: newUserId,
          email,
          firstName,
          lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);

    // Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    // Error genérico
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
