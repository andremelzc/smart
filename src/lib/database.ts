import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`
};

let pool: oracledb.Pool | null = null;

async function getPool(): Promise<oracledb.Pool> {
  if (!pool) {
    try {
      console.log("🔌 Creando pool de conexiones de Oracle...");
      pool = await oracledb.createPool(dbConfig);
      console.log("✅ Pool de conexiones de Oracle creado.");
    } catch (err) {
      console.error("Error al crear el pool de Oracle:", err);
      throw new Error("No se pudo inicializar la conexión a la base de datos.");
    }
  }
  return pool;
}

export async function executeQuery(sql: string, binds: any = {}) {
  let connection: oracledb.Connection | undefined;
  
  try {
    const poolInstance = await getPool();
    connection = await poolInstance.getConnection();

    const options: oracledb.ExecuteOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true 
    };

    const result = await connection.execute(sql, binds, options);
    return result;

  } catch (err) {
    console.error("Error en la consulta Oracle:", err);
    throw err; // Lanza el error para que tu API lo capture
  } finally {
    if (connection) {
      try {
        await connection.close(); // ¡CRÍTICO! Devuelve la conexión al pool
      } catch (err) {
        console.error("Error al cerrar la conexión:", err);
      }
    }
  }
}

export { oracledb };