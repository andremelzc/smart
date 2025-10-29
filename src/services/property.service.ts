import oracledb from 'oracledb';
import { UpdatePropertyBody } from '@/src/types/dtos/properties.dto';

export class PropertyService {
  /**
   * Actualiza una propiedad usando el stored procedure SP_UPDATE_PROPERTY
   * @param propertyId - ID de la propiedad a actualizar
   * @param data - Datos a actualizar
   * @returns Promise con el resultado o lanza un error
   */
  static async updateProperty(
    propertyId: number,
    data: UpdatePropertyBody
  ): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      // Obtener conexión del pool
      const pool = await oracledb.getPool();
      connection = await pool.getConnection();

      // Preparar los parámetros para el SP
      const bindParams = {
        P_PROPERTY_ID: { 
          val: propertyId, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        // Campos de PROPERTIES (opcionales)
        P_TITLE: { 
          val: data.title ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_BASE_PRICE_NIGHT: { 
          val: data.basePriceNight ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        P_ADDRESS_TEXT: { 
          val: data.addressText ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_CITY: { 
          val: data.city ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_STATE_REGION: { 
          val: data.stateRegion ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_COUNTRY: { 
          val: data.country ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_POSTAL_CODE: { 
          val: data.postalCode ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_LATITUDE: { 
          val: data.latitude ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        P_LONGITUDE: { 
          val: data.longitude ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        // Campos de PROPERTY_DETAILS (opcionales)
        P_DESCRIPTION_LONG: { 
          val: data.descriptionLong ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_HOUSE_RULES: { 
          val: data.houseRules ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_CHECKIN_TIME: { 
          val: data.checkinTime ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_CHECKOUT_TIME: { 
          val: data.checkoutTime ?? null, 
          type: oracledb.STRING, 
          dir: oracledb.BIND_IN 
        },
        P_CAPACITY: { 
          val: data.capacity ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        P_BEDROOMS: { 
          val: data.bedrooms ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        P_BATHROOMS: { 
          val: data.bathrooms ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        P_BEDS: { 
          val: data.beds ?? null, 
          type: oracledb.NUMBER, 
          dir: oracledb.BIND_IN 
        },
        // Parámetro de salida
        OUT_ERROR_CODE: { 
          type: oracledb.STRING, 
          dir: oracledb.BIND_OUT, 
          maxSize: 4000 
        }
      };

      // Ejecutar el stored procedure
      const result = await connection.execute(
        `BEGIN 
          PROPERTY_PKG.SP_UPDATE_PROPERTY(
            P_PROPERTY_ID => :P_PROPERTY_ID,
            P_TITLE => :P_TITLE,
            P_BASE_PRICE_NIGHT => :P_BASE_PRICE_NIGHT,
            P_ADDRESS_TEXT => :P_ADDRESS_TEXT,
            P_CITY => :P_CITY,
            P_STATE_REGION => :P_STATE_REGION,
            P_COUNTRY => :P_COUNTRY,
            P_POSTAL_CODE => :P_POSTAL_CODE,
            P_LATITUDE => :P_LATITUDE,
            P_LONGITUDE => :P_LONGITUDE,
            P_DESCRIPTION_LONG => :P_DESCRIPTION_LONG,
            P_HOUSE_RULES => :P_HOUSE_RULES,
            P_CHECKIN_TIME => :P_CHECKIN_TIME,
            P_CHECKOUT_TIME => :P_CHECKOUT_TIME,
            P_CAPACITY => :P_CAPACITY,
            P_BEDROOMS => :P_BEDROOMS,
            P_BATHROOMS => :P_BATHROOMS,
            P_BEDS => :P_BEDS,
            OUT_ERROR_CODE => :OUT_ERROR_CODE
          );
        END;`,
        bindParams,
        { autoCommit: false } // El SP hace su propio COMMIT
      );

      // Verificar si hubo un error
      const errorCode = (result.outBinds as any)?.OUT_ERROR_CODE;

      if (errorCode) {
        // Hubo un error en el SP
        await connection.rollback();
        throw new Error(errorCode);
      }

    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error al cerrar la conexión:', err);
        }
      }
    }
  }
}

