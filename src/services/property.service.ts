import oracledb from 'oracledb';
import { UpdatePropertyBody, PropertyDetail, HostInfo, PropertyAmenity, PropertyImage, PropertyReviews, PropertyReview } from '@/src/types/dtos/properties.dto';
import { getConnection } from '@/src/lib/database';

export class PropertyService {

  /**
   * Helper para procesar datos de Oracle de manera segura y evitar referencias circulares
   */
  private static processOracleData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Si es un Date, convertir a string
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Si es un número o string básico, retornar tal cual
    if (typeof data === 'number' || typeof data === 'string' || typeof data === 'boolean') {
      return data;
    }

    // Si es un array, procesar cada elemento
    if (Array.isArray(data)) {
      return data.map(item => this.processOracleData(item));
    }

    // Si es un objeto, crear uno nuevo con las propiedades seguras
    if (typeof data === 'object') {
      const result: any = {};
      
      // Solo copiar propiedades propias del objeto
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          
          // Evitar propiedades que pueden causar referencias circulares
          if (key.startsWith('_') || 
              key === 'constructor' || 
              key === 'prototype' ||
              typeof value === 'function') {
            continue;
          }

          result[key] = this.processOracleData(value);
        }
      }
      
      return result;
    }

    return data;
  }

  /**
   * Helper para mapear resultados de Oracle que pueden venir como arrays
   */
  private static async mapOracleResults(result: any): Promise<any[]> {
    console.log('mapOracleResults input:', {
      hasResult: !!result,
      hasRows: !!result?.rows,
      rowsLength: result?.rows?.length,
      firstRowType: typeof result?.rows?.[0],
      isFirstRowArray: Array.isArray(result?.rows?.[0])
    });
    
    if (!result.rows || result.rows.length === 0) {
      console.log('mapOracleResults: No rows found, returning empty array');
      return [];
    }

    if (Array.isArray(result.rows[0])) {
      console.log('mapOracleResults: Processing array format');
      // Los datos vienen como arrays, mapear usando metaData
      const metaData = result.metaData as any[];
      const mapped = [];
      
      for (const row of result.rows) {
        const obj: any = {};
        
        for (let i = 0; i < metaData.length; i++) {
          const columnName = metaData[i].name;
          let value = row[i];
          
          // Si es un LOB, leerlo
          if (value && typeof value === 'object' && value._type && 
              (value._type.toString().includes('CLOB') || value._type.toString().includes('BLOB'))) {
            try {
              console.log(`Reading LOB for column ${columnName}`);
              value = await value.getData();
            } catch (error) {
              console.warn(`Error reading LOB for column ${columnName}:`, error);
              value = null;
            }
          }
          
          obj[columnName] = value;
          // También agregar versión lowercase para compatibilidad
          obj[columnName.toLowerCase()] = value;
        }
        
        console.log('Mapped object keys:', Object.keys(obj));
        console.log('Sample mapped object properties:', {
          PROPERTY_ID: obj.PROPERTY_ID,
          TITLE: obj.TITLE,
          HOST_ID: obj.HOST_ID
        });
        mapped.push(obj);
      }
      
      console.log('mapOracleResults: Mapped array format, result length:', mapped.length);
      return mapped;
    } else {
      console.log('mapOracleResults: Processing object format');
      // Los datos ya vienen como objetos
      return result.rows as any[];
    }
  }

  /**
   * Obtiene una propiedad específica con todos los detalles para reserva
   * @param propertyId - ID de la propiedad a obtener
   * @returns Promise con los datos de la propiedad o lanza un error
   */
  static async getPropertyById(propertyId: number): Promise<PropertyDetail> {
      let connection: oracledb.Connection | undefined;

      try {
          connection = await getConnection();

          // Parámetros para el stored procedure
          const bindParams: oracledb.BindParameters = {
            p_property_id: { val: propertyId, dir: oracledb.BIND_IN },
            out_details_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
            out_images_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
            out_amenities_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
            out_reviews_summary_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
            out_reviews_list_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
            out_error_code: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
          };

          // Ejecutar el stored procedure
          const result = await connection.execute(
            `
            BEGIN
                PROPERTY_PKG.SP_GET_PROPERTY_PAGE_DETAILS(
                    P_PROPERTY_ID => :p_property_id,
                    OUT_DETAILS_CURSOR => :out_details_cursor,
                    OUT_IMAGES_CURSOR => :out_images_cursor,
                    OUT_AMENITIES_CURSOR => :out_amenities_cursor,
                    OUT_REVIEWS_SUMMARY_CUR => :out_reviews_summary_cur,
                    OUT_REVIEWS_LIST_CURSOR => :out_reviews_list_cursor,
                    OUT_ERROR_CODE => :out_error_code
                );
            END;`,
            bindParams,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );

          // Verificar si hubo un error
          const outBinds = result.outBinds as {
            out_details_cursor?: oracledb.ResultSet<any>;
            out_images_cursor?: oracledb.ResultSet<any>;
            out_amenities_cursor?: oracledb.ResultSet<any>;
            out_reviews_summary_cur?: oracledb.ResultSet<any>;
            out_reviews_list_cursor?: oracledb.ResultSet<any>;
            out_error_code?: string;
          };

          if (outBinds?.out_error_code) {
            throw new Error(outBinds.out_error_code);
          }

          // Procesar cursor de detalles
          const detailsCursor = outBinds?.out_details_cursor;
          let detailsRow: any = null;
          if (detailsCursor) {
            const rawRow = await detailsCursor.getRow();
            detailsRow = rawRow ? this.processOracleData(rawRow) : null;
            await detailsCursor.close();
          }

          if (!detailsRow) {
            throw new Error('Propiedad no encontrada');
          }

          // Procesar cursor de imágenes
          const imagesCursor = outBinds?.out_images_cursor;
          const images: PropertyImage[] = [];
          if (imagesCursor) {
            let imageRow;
            let imageIndex = 0;
            while ((imageRow = await imagesCursor.getRow())) {
              const processedImageRow = this.processOracleData(imageRow);
              images.push({
                id: imageIndex++,
                url: processedImageRow.URL || '',
                alt: processedImageRow.CAPTION || '',
                isPrimary: imageIndex === 1
              });
            }
            await imagesCursor.close();
          }

          // Procesar cursor de amenities
          const amenitiesCursor = outBinds?.out_amenities_cursor;
          const amenities: PropertyAmenity[] = [];
          if (amenitiesCursor) {
            let amenityRow;
            while ((amenityRow = await amenitiesCursor.getRow())) {
              const processedAmenityRow = this.processOracleData(amenityRow);
              amenities.push({
                name: processedAmenityRow.NAME || '',
                icon: processedAmenityRow.CODE || '',
                description: processedAmenityRow.DESCRIPTION || ''
              });
            }
            await amenitiesCursor.close();
          }

          // Procesar cursor de resumen de reviews
          const reviewsSummaryCursor = outBinds?.out_reviews_summary_cur;
          let reviewsSummary: any = { TOTAL_COUNT: 0, AVERAGE_RATING: 0 };
          if (reviewsSummaryCursor) {
            const rawSummaryRow = await reviewsSummaryCursor.getRow();
            if (rawSummaryRow) {
              reviewsSummary = this.processOracleData(rawSummaryRow);
            }
            await reviewsSummaryCursor.close();
          }

          // Procesar cursor de lista de reviews
          const reviewsListCursor = outBinds?.out_reviews_list_cursor;
          const reviewsList: PropertyReview[] = [];
          if (reviewsListCursor) {
            let reviewRow;
            while ((reviewRow = await reviewsListCursor.getRow())) {
              const processedReviewRow = this.processOracleData(reviewRow);
              reviewsList.push({
                rating: processedReviewRow.RATING || 0,
                comment: processedReviewRow.comment || '',
                createdAt: typeof processedReviewRow.CREATED_AT === 'string' 
                  ? processedReviewRow.CREATED_AT 
                  : (processedReviewRow.CREATED_AT instanceof Date 
                    ? processedReviewRow.CREATED_AT.toISOString() 
                    : ''),
                authorName: `${processedReviewRow.AUTHOR_FIRST_NAME || ''} ${processedReviewRow.AUTHOR_LAST_NAME || ''}`.trim()
              });
            }
            await reviewsListCursor.close();
          }

          // Construir el objeto PropertyDetail
          const propertyDetail: PropertyDetail = {
            propertyId: propertyId,
            hostId: detailsRow.HOST_ID || 0,
            title: detailsRow.TITLE || '',
            propertyType: detailsRow.PROPERTY_TYPE || '',
            basePriceNight: detailsRow.BASE_PRICE_NIGHT || 0,
            currencyCode: detailsRow.CURRENCY_CODE || 'USD',
            addressText: detailsRow.FORMATTED_ADDRESS || '',
            city: detailsRow.CITY || '',
            stateRegion: detailsRow.STATE_REGION || '',
            country: detailsRow.COUNTRY || '',
            postalCode: '',
            latitude: detailsRow.LATITUDE || 0,
            longitude: detailsRow.LONGITUDE || 0,
            isActive: true,
            descriptionLong: detailsRow.DESCRIPTION_LONG || '',
            houseRules: detailsRow.HOUSE_RULES || '',
            checkinTime: detailsRow.CHECKIN_TIME || '',
            checkoutTime: detailsRow.CHECKOUT_TIME || '',
            capacity: detailsRow.CAPACITY || 0,
            bedrooms: detailsRow.BEDROOMS || 0,
            bathrooms: detailsRow.BATHROOMS || 0,
            beds: detailsRow.BEDS || 0,
            host: {
              id: detailsRow.HOST_ID || 0,
              name: `${detailsRow.HOST_FIRST_NAME || ''} ${detailsRow.HOST_LAST_NAME || ''}`.trim(),
              memberSince: typeof detailsRow.HOST_JOINED_AT === 'string' 
                ? detailsRow.HOST_JOINED_AT 
                : (detailsRow.HOST_JOINED_AT instanceof Date 
                  ? detailsRow.HOST_JOINED_AT.toISOString() 
                  : ''),
              isVerified: detailsRow.HOST_IS_VERIFIED === 1
            },
            amenities,
            images,
            reviews: {
              totalCount: reviewsSummary.TOTAL_COUNT || 0,
              averageRating: reviewsSummary.AVERAGE_RATING || 0,
              reviewsList
            }
          };

          return propertyDetail;

      } catch (err) {
          console.error('Error al obtener la propiedad:', err);
          if (err instanceof Error && err.message.includes('Propiedad no encontrada')) {
              throw err;
          }
          throw new Error('No se pudo cargar el detalle de la propiedad.');
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
      const pool = oracledb.getPool();
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
