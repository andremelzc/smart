import { executeQuery, oracledb } from "@/src/lib/database";
import bcrypt from "bcryptjs";

interface AuthResult {
  success: boolean;
  errorCode?: string;
  userId?: number;
}

interface UserData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
}

export const authStoredProcedures = {
  /**
   * Registra un nuevo usuario con credenciales usando SP_REGISTER_WITH_CREDENTIALS
   */
  async registerWithCredentials(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<AuthResult & { userId?: number }> {
    
    // Hash la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      BEGIN 
        AUTH_PKG.SP_REGISTER_WITH_CREDENTIALS(
          :p_email,
          :p_password_hash,
          :p_first_name,
          :p_last_name,
          :out_success,
          :out_error_code,
          :out_user_id
        ); 
      END;`;

    const binds = {
      p_email: email,
      p_password_hash: hashedPassword,
      p_first_name: firstName,
      p_last_name: lastName,
      out_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_error_code: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      out_user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    try {
      console.log("Ejecutando SP_REGISTER_WITH_CREDENTIALS con:", { email, firstName, lastName });
      
      const result = await executeQuery(sql, binds) as { outBinds?: { out_success?: number; out_error_code?: string; out_user_id?: number } };
      
      console.log("Resultado completo del SP:", JSON.stringify(result, null, 2));
      
      const success = result?.outBinds?.out_success as number;
      const errorCode = result?.outBinds?.out_error_code as string;
      const userId = result?.outBinds?.out_user_id as number;

      console.log("Valores extraídos:", { success, errorCode, userId });

      return {
        success: success === 1,
        errorCode: success === 1 ? undefined : errorCode,
        userId: success === 1 ? userId : undefined
      };
      
    } catch (error) {
      console.error("Error in registerWithCredentials SP:", error);
      return {
        success: false,
        errorCode: "INTERNAL_ERROR"
      };
    }
  },

  /**
   * Valida credenciales de usuario usando SP_LOGIN_WITH_CREDENTIALS
   */
  async validateCredentials(email: string, password: string): Promise<AuthResult & { userData?: UserData }> {
    try {
      // Primero obtenemos el hash de la contraseña de la BD
      const getUserHashSql = `
        SELECT a.PASSWORD_HASH 
        FROM USER_AUTH_IDENTITIES a
        WHERE a.PROVIDER = 'credentials' 
          AND LOWER(a.EMAIL) = LOWER(:email)
      `;
      
      console.log("Buscando hash para email:", email);
      
      const userHashResult = await executeQuery(getUserHashSql, { email }) as { rows?: { PASSWORD_HASH: string }[] };
      
      console.log("Resultado de búsqueda de hash:", JSON.stringify(userHashResult, null, 2));
      
      if (!userHashResult.rows || userHashResult.rows.length === 0) {
        console.log("No se encontró usuario con credenciales para email:", email);
        return {
          success: false,
          errorCode: "INVALID_CREDENTIALS"
        };
      }
      
      const storedHash = userHashResult.rows[0].PASSWORD_HASH as string;
      console.log("Hash encontrado:", storedHash ? "SÍ" : "NO (undefined)");
      
      // Comparar la contraseña con bcrypt ANTES de llamar al SP
      const passwordMatch = await bcrypt.compare(password, storedHash);
      
      if (!passwordMatch) {
        console.log("Contraseña incorrecta para email:", email);
        return {
          success: false,
          errorCode: "INVALID_CREDENTIALS"
        };
      }

      console.log("Contraseña correcta, procediendo con SP...");

      // Necesitamos usar conexión directa para cursores
      const { getConnection } = await import("@/src/lib/database");
      const connection = await getConnection();
      
      try {
        // Ahora llamar al SP con el hash correcto (ya validamos la contraseña)
        const sql = `
          BEGIN 
            AUTH_PKG.SP_LOGIN_WITH_CREDENTIALS(
              :p_username,
              :p_password_hash,
              :out_success,
              :out_error_code,
              :out_user_cursor
            ); 
          END;`;

        const binds = {
          p_username: email,
          p_password_hash: storedHash, // El hash que obtuvimos de la BD
          out_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          out_error_code: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          out_user_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        };

        console.log("Ejecutando SP_LOGIN_WITH_CREDENTIALS...");
        
        // Para cursores, no usar executeOptions especiales
        const result = await connection.execute(sql, binds) as { 
          outBinds?: { 
            out_success?: number; 
            out_error_code?: string; 
            out_user_cursor?: any 
          } 
        };
        
        console.log("Resultado del SP de login:", JSON.stringify({
          outBinds: result?.outBinds ? {
            out_success: result.outBinds.out_success,
            out_error_code: result.outBinds.out_error_code,
            out_user_cursor: result.outBinds.out_user_cursor ? "CURSOR_EXISTS" : "NO_CURSOR"
          } : "NO_OUTBINDS"
        }, null, 2));
        
        const success = result?.outBinds?.out_success as number;
        const errorCode = result?.outBinds?.out_error_code as string;
        
        if (!success || success === 0) {
          return {
            success: false,
            errorCode
          };
        }

        // Procesar el cursor del usuario
        const userCursor = result?.outBinds?.out_user_cursor;
        
        if (userCursor) {
          console.log("Procesando cursor de usuario...");
          
          try {
            // Obtener todas las filas del cursor
            const userRows = await userCursor.getRows(0); // 0 = todas las filas
            console.log("Filas obtenidas del cursor:", userRows?.length || 0);
            
            if (userRows && userRows.length > 0) {
              const userRow = userRows[0];
              console.log("Datos del usuario obtenidos (array):", userRow);
              
              // El cursor devuelve los datos como array, mapear según el SELECT * FROM USERS
              // Basado en el log: [84, 'Ivan', 'Melendez Cava', 'andreml07zc@gmail.com', ...]
              return {
                success: true,
                userData: {
                  userId: userRow[0], // USER_ID
                  firstName: userRow[1], // FIRST_NAME  
                  lastName: userRow[2], // LAST_NAME
                  email: userRow[3], // EMAIL
                  status: userRow[8] || 'active', // Posición aproximada del STATUS
                  emailVerified: true // Por defecto true si llegó hasta aquí
                }
              };
            } else {
              console.log("Cursor vacío - no se encontraron datos del usuario");
            }
          } finally {
            // Siempre cerrar el cursor
            await userCursor.close();
          }
        } else {
          console.log("No se recibió cursor del SP");
        }

        return {
          success: false,
          errorCode: "USER_DATA_ERROR"
        };
        
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (closeError) {
            console.error("Error closing connection:", closeError);
          }
        }
      }
      
    } catch (error) {
      console.error("Error in validateCredentials SP:", error);
      return {
        success: false,
        errorCode: "INTERNAL_ERROR"
      };
    }
  },

  /**
   * Mapea códigos de error a mensajes amigables
   */
  getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'EMAIL_ALREADY_EXISTS': 'Ya existe una cuenta con este correo electrónico',
      'INVALID_CREDENTIALS': 'Email o contraseña incorrectos',
      'USER_INACTIVE': 'Tu cuenta está inactiva. Contacta al soporte.',
      'EMAIL_NOT_VERIFIED': 'Debes verificar tu email antes de iniciar sesión',
      'USER_DATA_ERROR': 'Error al obtener los datos del usuario',
      'INTERNAL_ERROR': 'Error interno del servidor'
    };
    
    return errorMessages[errorCode] || 'Error desconocido';
  }
};