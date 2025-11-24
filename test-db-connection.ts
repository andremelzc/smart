import oracledb from "oracledb";

const testConnection = async () => {
  console.log("🔍 Probando conexión a Oracle DB...\n");

  const config = {
    user: process.env.DB_USERNAME || "SMART",
    password: process.env.DB_PASSWORD || "123456",
    connectString: `${process.env.DB_HOST || "34.56.183.89"}:${process.env.DB_PORT || "1521"}/${process.env.DB_SID || "XEPDB1"}`,
    connectTimeout: 60,
  };

  console.log("📋 Configuración:");
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   SID: ${process.env.DB_SID}`);
  console.log(`   User: ${process.env.DB_USERNAME}`);
  console.log(`   Connect String: ${config.connectString}\n`);

  let connection;

  try {
    console.log("⏳ Intentando conectar...");
    connection = await oracledb.getConnection(config);
    console.log("✅ Conexión exitosa!\n");

    console.log("📊 Información de la conexión:");
    console.log(
      `   Oracle Client Version: ${oracledb.oracleClientVersionString}`
    );
    console.log(`   Connection ID: ${connection.tag || "N/A"}\n`);

    // Probar una consulta simple
    console.log("🔎 Ejecutando consulta de prueba...");
    const result = await connection.execute("SELECT 1 as TEST FROM DUAL");
    console.log("✅ Consulta ejecutada:", result.rows);

    // Probar la tabla de amenities
    console.log("\n🏷️  Probando tabla AMENITIES...");
    const amenitiesResult = await connection.execute(
      "SELECT COUNT(*) as TOTAL FROM AMENITIES"
    );
    console.log("✅ Total de amenities:", amenitiesResult.rows);
  } catch (err) {
    console.error("❌ Error de conexión:", err);

    if (err instanceof Error) {
      console.error("\n📝 Detalles del error:");
      console.error(`   Mensaje: ${err.message}`);
      console.error(`   Código: ${(err as any).code || "N/A"}`);

      if ((err as any).code === "NJS-510") {
        console.error("\n💡 Posibles causas:");
        console.error("   1. El servidor de base de datos no está accesible");
        console.error("   2. Firewall bloqueando la conexión");
        console.error("   3. Host/Puerto/SID incorrectos");
        console.error("   4. La instancia de base de datos está detenida");
      }
    }

    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("\n🔒 Conexión cerrada correctamente");
      } catch (err) {
        console.error("Error al cerrar conexión:", err);
      }
    }
  }
};

testConnection();
