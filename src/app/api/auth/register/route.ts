import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getConnection } from "@/src/lib/database";
import oracledb from 'oracledb';

// Schema de validación para el registro
const registerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").trim(),
  lastName: z.string().min(1, "El apellido es obligatorio").trim(),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  let connection;

  try {
    // Parsear y validar el body de la request
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { firstName, lastName, email, password } = validatedData;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Obtener conexión a Oracle
    connection = await getConnection();

    // Verificar si el usuario ya existe
    const checkUserQuery = `
      SELECT user_id 
      FROM users 
      WHERE LOWER(email) = LOWER(:email)
    `;

    const existingUser = await connection.execute(
      checkUserQuery,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existingUser.rows && existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 400 }
      );
    }

    // Crear nuevo usuario directamente en la tabla
    const createUserResult = await connection.execute(
      `INSERT INTO users (
         email, 
         password_hash, 
         first_name, 
         last_name,
         created_at,
         updated_at
       ) VALUES (
         :email, 
         :password_hash, 
         :first_name, 
         :last_name,
         SYSDATE,
         SYSDATE
       ) RETURNING user_id INTO :user_id`,
      {
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const newUserId = (createUserResult.outBinds as { user_id?: number })?.user_id;

    if (!newUserId) {
      throw new Error("Error al crear el usuario");
    }

    // Commit de la transacción
    await connection.commit();

    // Respuesta exitosa (sin datos sensibles)
    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        user: {
          id: newUserId,
          email,
          firstName,
          lastName
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error en registro:", error);

    // Rollback en caso de error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error en rollback:", rollbackError);
      }
    }

    // Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    // Manejar errores de Oracle específicos
    if (error && typeof error === 'object' && 'errorNum' in error) {
      const oracleError = error as { errorNum: number; message: string };
      
      // Violación de constraint único (email duplicado)
      if (oracleError.errorNum === 1) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con este correo electrónico" },
          { status: 400 }
        );
      }
      
      console.error("Oracle Error:", oracleError.errorNum, oracleError.message);
      return NextResponse.json(
        { error: "Error en la base de datos" },
        { status: 500 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );

  } finally {
    // Cerrar conexión
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError);
      }
    }
  }
}