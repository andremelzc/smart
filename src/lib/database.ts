import { DataSource } from "typeorm";

// Importar todas las entidades
import { Users } from "@/src/entities/Users";
import { UserAuthIdentities } from "@/src/entities/UserAuthIdentities";
import { UserPaymentMethods } from "@/src/entities/UserPaymentMethods";
import { TenantPreferences } from "@/src/entities/TenantPreferences";
import { Tenants } from "@/src/entities/Tenants";
import { Hosts } from "@/src/entities/Hosts";
import { Properties } from "@/src/entities/Properties";
import { PropertyDetails } from "@/src/entities/PropertyDetails";
import { PropertyImages } from "@/src/entities/PropertyImages";
import { Amenities } from "@/src/entities/Amenities";
import { Availabilities } from "@/src/entities/Availabilities";
import { Bookings } from "@/src/entities/Bookings";
import { Reviews } from "@/src/entities/Reviews";
import { Conversations } from "@/src/entities/Conversations";
import { ConversationParticipants } from "@/src/entities/ConversationParticipants";
import { Messages } from "@/src/entities/Messages";
import { Payments } from "@/src/entities/Payments";
import { PaymentDetails } from "@/src/entities/PaymentDetails";
import { PaymentTypes } from "@/src/entities/PaymentTypes";
import { Currencies } from "@/src/entities/Currencies";
import { FxRateQuotes } from "@/src/entities/FxRateQuotes";
import { Preferences } from "@/src/entities/Preferences";

// Configuración de conexión Oracle desde variables de entorno
const host = process.env.DB_HOST || "localhost";
const port = parseInt(process.env.DB_PORT || "1521");
const username = process.env.DB_USERNAME || "oracle";
const password = process.env.DB_PASSWORD || "password";
const sid = process.env.DB_SID || "XEPDB1";

// Construir connection string para Oracle
const connectionString = `${host}:${port}/${sid}`;

export const AppDataSource = new DataSource({
  type: "oracle",
  host,
  port,
  username,
  password,
  sid,
  synchronize: false, // ¡IMPORTANTE! No sincronizar en producción
  logging: process.env.NODE_ENV === "development",
  entities: [
    Users,
    UserAuthIdentities,
    UserPaymentMethods,
    TenantPreferences,
    Tenants,
    Hosts,
    Properties,
    PropertyDetails,
    PropertyImages,
    Amenities,
    Availabilities,
    Bookings,
    Reviews,
    Conversations,
    ConversationParticipants,
    Messages,
    Payments,
    PaymentDetails,
    PaymentTypes,
    Currencies,
    FxRateQuotes,
    Preferences,
  ],
  extra: {
    // Opciones adicionales para Oracle
    connectString: connectionString,
  },
});

// Singleton para evitar múltiples conexiones en Next.js hot reload
let dataSourceInstance: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSourceInstance) {
    dataSourceInstance = AppDataSource;
  }

  if (!dataSourceInstance.isInitialized) {
    console.log("🔌 Inicializando conexión a Oracle...");
    await dataSourceInstance.initialize();
    console.log("✅ Conexión a Oracle establecida");
  }

  return dataSourceInstance;
}

// Función para cerrar la conexión (útil en tests o scripts)
export async function closeDatabase(): Promise<void> {
  if (dataSourceInstance?.isInitialized) {
    await dataSourceInstance.destroy();
    dataSourceInstance = null;
    console.log("🔌 Conexión a Oracle cerrada");
  }
}
