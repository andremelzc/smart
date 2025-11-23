import oracledb from 'oracledb';

const dbConfig: oracledb.PoolAttributes = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`,
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  connectTimeout: 60, // Aumentar timeout a 60 segundos
  queueTimeout: 60000,
  enableStatistics: true
};

let pool: oracledb.Pool | null = null;

async function getPool(): Promise<oracledb.Pool> {
  if (!pool) {
    try {
      console.log("🔌 Creando pool de conexiones de Oracle...");
      console.log(`📍 Conectando a: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`);
      console.log(`👤 Usuario: ${process.env.DB_USERNAME}`);
      
      pool = await oracledb.createPool(dbConfig);
      
      console.log("✅ Pool de conexiones de Oracle creado.");
      console.log(`📊 Pool stats - Min: ${pool.poolMin}, Max: ${pool.poolMax}`);
    } catch (err) {
      console.error("❌ Error al crear el pool de Oracle:", err);
      if (err instanceof Error) {
        const oracleErr = err as Error & { code?: string };
        console.error("Detalles del error:", {
          message: oracleErr.message,
          code: oracleErr.code,
          stack: oracleErr.stack
        });
      }
      throw new Error("No se pudo inicializar la conexión a la base de datos.");
    }
  }
  return pool;
}

export async function getConnection(): Promise<oracledb.Connection> {
  const poolInstance = await getPool();
  const connection = await poolInstance.getConnection();
  return connection;
}

export async function executeQuery(
  sql: string, 
  binds: oracledb.BindParameters = {},
  options?: oracledb.ExecuteOptions
) {
  let connection: oracledb.Connection | undefined;
  
  try {
    const poolInstance = await getPool();
    connection = await poolInstance.getConnection();

    const executeOptions: oracledb.ExecuteOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    };

    const result = await connection.execute(sql, binds, executeOptions);
    return result;

  } catch (err) {
    console.error("Error en la consulta Oracle:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar la conexión:", err);
      }
    }
  }
}

export { oracledb };