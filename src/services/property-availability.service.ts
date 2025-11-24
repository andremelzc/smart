import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

export interface PropertyAvailabilityDay {
  date: string; // YYYY-MM-DD
  available: boolean;
  reason: "available" | "booked" | "blocked" | "maintenance";
}

export interface AvailabilitySummary {
  totalDays: number;
  availableDays: number;
  bookedDays: number;
  blockedDays: number;
  maintenanceDays: number;
}

/**
 * Service para gestionar la disponibilidad de propiedades
 *
 * Utiliza el package Oracle CALENDAR_AVAILABILITY_PKG con stored procedures
 * Sigue el mismo patrón que PROPERTY_PKG y BOOKING_PKG (OUT cursors)
 *
 * LÓGICA DE DISPONIBILIDAD (implementada en Oracle):
 *
 * 1. BOOKINGS (CONFIRMED/PENDING) → NO DISPONIBLE (reason: 'booked')
 *    - Las fechas con reservas confirmadas o pendientes están bloqueadas
 *
 * 2. AVAILABILITIES con KIND = 'BLOCKED' → NO DISPONIBLE (reason: 'blocked')
 *    - El host bloqueó manualmente estas fechas
 *
 * 3. AVAILABILITIES con KIND = 'MAINTENANCE' → NO DISPONIBLE (reason: 'maintenance')
 *    - El recinto está en mantenimiento
 *
 * 4. Por defecto → DISPONIBLE (reason: 'available')
 *    - Disponible con precio base de la propiedad
 */
export class PropertyAvailabilityService {
  /**
   * Obtiene la disponibilidad de una propiedad para un rango de fechas
   * Utiliza el stored procedure CALENDAR_AVAILABILITY_PKG.SP_GET_PROPERTY_AVAILABILITY
   */
  static async getPropertyAvailability(
    propertyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<PropertyAvailabilityDay[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      // Preparar parámetros para el SP (siguiendo patrón del proyecto)
      const bindParams: oracledb.BindParameters = {
        p_property_id: { val: propertyId, dir: oracledb.BIND_IN },
        p_start_date: {
          val: startDate.toISOString().split("T")[0],
          dir: oracledb.BIND_IN,
        },
        p_end_date: {
          val: endDate.toISOString().split("T")[0],
          dir: oracledb.BIND_IN,
        },
        out_availability_cursor: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
        out_error_code: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000,
        },
      };

      // Ejecutar el stored procedure
      const result = await connection.execute(
        `BEGIN
           CALENDAR_AVAILABILITY_PKG.SP_GET_PROPERTY_AVAILABILITY(
             P_PROPERTY_ID => :p_property_id,
             P_START_DATE => :p_start_date,
             P_END_DATE => :p_end_date,
             OUT_AVAILABILITY_CURSOR => :out_availability_cursor,
             OUT_ERROR_CODE => :out_error_code
           );
         END;`,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Verificar errores
      const outBinds = result.outBinds as {
        out_availability_cursor?: oracledb.ResultSet<unknown>;
        out_error_code?: string;
      };

      if (outBinds?.out_error_code) {
        throw new Error(outBinds.out_error_code);
      }

      // Procesar cursor de disponibilidad
      const availabilityCursor = outBinds?.out_availability_cursor;
      const availability: PropertyAvailabilityDay[] = [];

      if (availabilityCursor) {
        try {
          let row;
          while ((row = await availabilityCursor.getRow())) {
            const dataRow = row as {
              DATE_STR: string;
              IS_AVAILABLE: number;
              REASON: string;
            };
            availability.push({
              date: dataRow.DATE_STR,
              available: dataRow.IS_AVAILABLE === 1,
              reason: dataRow.REASON as
                | "available"
                | "booked"
                | "blocked"
                | "maintenance",
            });
          }
        } finally {
          await availabilityCursor.close();
        }
      }

      return availability;
    } catch (error) {
      console.error("Error fetching property availability:", error);
      throw new Error("Failed to fetch property availability");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Verifica si un rango de fechas está completamente disponible
   * Utiliza el stored procedure CALENDAR_AVAILABILITY_PKG.SP_CHECK_RANGE_AVAILABILITY
   */
  static async isRangeAvailable(
    propertyId: number,
    checkinDate: Date,
    checkoutDate: Date
  ): Promise<boolean> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      // Preparar parámetros para el SP
      const bindParams: oracledb.BindParameters = {
        p_property_id: { val: propertyId, dir: oracledb.BIND_IN },
        p_checkin_date: {
          val: checkinDate.toISOString().split("T")[0],
          dir: oracledb.BIND_IN,
        },
        p_checkout_date: {
          val: checkoutDate.toISOString().split("T")[0],
          dir: oracledb.BIND_IN,
        },
        out_is_available: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_error_code: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000,
        },
      };

      // Ejecutar el stored procedure
      const result = await connection.execute(
        `BEGIN
           CALENDAR_AVAILABILITY_PKG.SP_CHECK_RANGE_AVAILABILITY(
             P_PROPERTY_ID => :p_property_id,
             P_CHECKIN_DATE => :p_checkin_date,
             P_CHECKOUT_DATE => :p_checkout_date,
             OUT_IS_AVAILABLE => :out_is_available,
             OUT_ERROR_CODE => :out_error_code
           );
         END;`,
        bindParams
      );

      // Verificar errores
      const outBinds = result.outBinds as {
        out_is_available?: number;
        out_error_code?: string;
      };

      if (outBinds?.out_error_code) {
        throw new Error(outBinds.out_error_code);
      }

      return outBinds?.out_is_available === 1;
    } catch (error) {
      console.error("Error checking range availability:", error);
      throw new Error("Failed to check range availability");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Obtiene resumen de disponibilidad para un período
   * Este método NO usa stored procedure, calcula el resumen en TypeScript
   * a partir de los datos obtenidos de get_property_availability
   */
  static async getAvailabilitySummary(
    propertyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilitySummary> {
    const availability = await this.getPropertyAvailability(
      propertyId,
      startDate,
      endDate
    );

    const summary: AvailabilitySummary = {
      totalDays: availability.length,
      availableDays: 0,
      bookedDays: 0,
      blockedDays: 0,
      maintenanceDays: 0,
    };

    availability.forEach((day) => {
      if (day.available) {
        summary.availableDays++;
      } else {
        switch (day.reason) {
          case "booked":
            summary.bookedDays++;
            break;
          case "blocked":
            summary.blockedDays++;
            break;
          case "maintenance":
            summary.maintenanceDays++;
            break;
        }
      }
    });

    return summary;
  }

  /**
   * Obtiene los próximos N días disponibles
   * Utiliza el stored procedure CALENDAR_AVAILABILITY_PKG.SP_GET_NEXT_AVAILABLE_DATES
   */
  static async getNextAvailableDates(
    propertyId: number,
    count: number = 5
  ): Promise<string[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      // Preparar parámetros para el SP
      const bindParams: oracledb.BindParameters = {
        p_property_id: { val: propertyId, dir: oracledb.BIND_IN },
        p_count: { val: count, dir: oracledb.BIND_IN },
        out_dates_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        out_error_code: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 4000,
        },
      };

      // Ejecutar el stored procedure
      const result = await connection.execute(
        `BEGIN
           CALENDAR_AVAILABILITY_PKG.SP_GET_NEXT_AVAILABLE_DATES(
             P_PROPERTY_ID => :p_property_id,
             P_COUNT => :p_count,
             OUT_DATES_CURSOR => :out_dates_cursor,
             OUT_ERROR_CODE => :out_error_code
           );
         END;`,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Verificar errores
      const outBinds = result.outBinds as {
        out_dates_cursor?: oracledb.ResultSet<unknown>;
        out_error_code?: string;
      };

      if (outBinds?.out_error_code) {
        throw new Error(outBinds.out_error_code);
      }

      // Procesar cursor de fechas
      const datesCursor = outBinds?.out_dates_cursor;
      const dates: string[] = [];

      if (datesCursor) {
        try {
          let row;
          while ((row = await datesCursor.getRow())) {
            const dataRow = row as { AVAILABLE_DATE: string };
            dates.push(dataRow.AVAILABLE_DATE);
          }
        } finally {
          await datesCursor.close();
        }
      }

      return dates;
    } catch (error) {
      console.error("Error fetching next available dates:", error);
      throw new Error("Failed to fetch next available dates");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Bloquea fechas manualmente (KIND='BLOCKED')
   * Inserta en AVAILABILITIES
   */
  static async blockDates(
    propertyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      await connection.execute(
        `INSERT INTO AVAILABILITIES (PROPERTY_ID, START_DATE, END_DATE, KIND)
         VALUES (:propertyId, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), 'BLOCKED')`,
        {
          propertyId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        { autoCommit: true }
      );
    } catch (error) {
      console.error("Error blocking dates:", error);
      throw new Error("Failed to block dates");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Marca fechas como mantenimiento (KIND='MAINTENANCE')
   * Inserta en AVAILABILITIES
   */
  static async markMaintenance(
    propertyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      await connection.execute(
        `INSERT INTO AVAILABILITIES (PROPERTY_ID, START_DATE, END_DATE, KIND)
         VALUES (:propertyId, TO_DATE(:startDate, 'YYYY-MM-DD'), TO_DATE(:endDate, 'YYYY-MM-DD'), 'MAINTENANCE')`,
        {
          propertyId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
        { autoCommit: true }
      );
    } catch (error) {
      console.error("Error marking maintenance:", error);
      throw new Error("Failed to mark maintenance");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Desbloquea fechas (elimina de AVAILABILITIES)
   * Para desbloquear un rango específico con KIND específico
   */
  static async unblockDates(
    propertyId: number,
    startDate: Date,
    endDate: Date,
    kind: "BLOCKED" | "MAINTENANCE"
  ): Promise<void> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      await connection.execute(
        `DELETE FROM AVAILABILITIES 
         WHERE PROPERTY_ID = :propertyId
           AND START_DATE = TO_DATE(:startDate, 'YYYY-MM-DD')
           AND END_DATE = TO_DATE(:endDate, 'YYYY-MM-DD')
           AND KIND = :kind`,
        {
          propertyId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          kind,
        },
        { autoCommit: true }
      );
    } catch (error) {
      console.error("Error unblocking dates:", error);
      throw new Error("Failed to unblock dates");
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }
}
