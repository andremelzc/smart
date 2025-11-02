import oracledb from 'oracledb';
import { getConnection } from '@/src/lib/database';
import { PropertyFilterDto } from '@/src/types/dtos/properties.dto';

export class PropertyFilterService {
  /**
   * Ejecuta el filtro de propiedades usando el SP FILTER_PKG.SP_SEARCH_PROPERTIES
   * y devuelve los resultados como un arreglo de objetos.
   */
  static async searchProperties(filters: PropertyFilterDto): Promise<any[]> {
    let connection: oracledb.Connection | undefined;

    try {
      // ✅ Reutilizamos el helper global para compartir el pool
      connection = await getConnection();

      let amenitiesType: oracledb.DBObjectClass<unknown> | undefined;
      let amenitiesValue: unknown = null;

      if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
        amenitiesType = await connection.getDbObjectClass('SYS.ODCINUMBERLIST');
        amenitiesValue = new amenitiesType(filters.amenities);
      }

      const amenitiesParam: oracledb.BindParameter = amenitiesType
        ? ({
            dir: oracledb.BIND_IN,
            type: amenitiesType,
            val: amenitiesValue,
          } as unknown as oracledb.BindParameter)
        : { dir: oracledb.BIND_IN, val: null };

      // Parámetros de entrada/salida
      const bindParams: oracledb.BindParameters = {
        p_city: { val: filters.city ?? null, dir: oracledb.BIND_IN },
        p_min_price: { val: filters.minPrice ?? null, dir: oracledb.BIND_IN },
        p_max_price: { val: filters.maxPrice ?? null, dir: oracledb.BIND_IN },
        p_rooms: { val: filters.rooms ?? null, dir: oracledb.BIND_IN },
        p_beds: { val: filters.beds ?? null, dir: oracledb.BIND_IN },
        p_baths: { val: filters.baths ?? null, dir: oracledb.BIND_IN },
        p_lat_min: { val: filters.latMin ?? null, dir: oracledb.BIND_IN },
        p_lat_max: { val: filters.latMax ?? null, dir: oracledb.BIND_IN },
        p_lng_min: { val: filters.lngMin ?? null, dir: oracledb.BIND_IN },
        p_lng_max: { val: filters.lngMax ?? null, dir: oracledb.BIND_IN },
        p_amenities: amenitiesParam,
        p_result_set: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `
        BEGIN
            FILTER_PKG.SP_SEARCH_PROPERTIES(
            p_city        => :p_city,
            p_min_price   => :p_min_price,
            p_max_price   => :p_max_price,
            p_rooms       => :p_rooms,
            p_beds        => :p_beds,
            p_baths       => :p_baths,
            p_lat_min     => :p_lat_min,
            p_lat_max     => :p_lat_max,
            p_lng_min     => :p_lng_min,
            p_lng_max     => :p_lng_max,
            p_amenities   => :p_amenities,
            p_result_set  => :p_result_set
            );
        END;`,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

      // ✅ Cast seguro para evitar el error TS
      const outBinds = result.outBinds as { p_result_set?: oracledb.ResultSet<any> };
      const cursor = outBinds?.p_result_set;

      const rows: any[] = [];
      let row;

      if (cursor) {
        while ((row = await cursor.getRow())) {
          rows.push(row);
        }
        await cursor.close();
      }

      return rows;
    } catch (error) {
      console.error('Error ejecutando FILTER_PKG.SP_SEARCH_PROPERTIES:', error);
      throw error;
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
