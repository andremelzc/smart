import oracledb from "oracledb";
import {
  UpdatePropertyBody,
  PropertyDetail,
  PropertyAmenity,
  PropertyImage,
  PropertyReview,
} from "@/src/types/dtos/properties.dto";
import { getConnection } from "@/src/lib/database";

// Tipos para datos de Oracle
interface OracleLob {
  getData: () => Promise<Buffer>;
  allowHalfOpen?: boolean;
  offset?: number;
}

interface OraclePropertyRow {
  PROPERTY_ID?: number;
  HOST_ID?: number;
  TITLE?: string;
  PROPERTY_TYPE?: string;
  BASE_PRICE_NIGHT?: number;
  CURRENCY_CODE?: string;
  FORMATTED_ADDRESS?: string;
  CITY?: string;
  STATE_REGION?: string;
  COUNTRY?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  DESCRIPTION_LONG?: string;
  HOUSE_RULES?: string;
  CHECKIN_TIME?: string;
  CHECKOUT_TIME?: string;
  CAPACITY?: number;
  BEDROOMS?: number;
  BATHROOMS?: number;
  BEDS?: number;
  HOST_FIRST_NAME?: string;
  HOST_LAST_NAME?: string;
  HOST_JOINED_AT?: string | Date;
  HOST_IS_VERIFIED?: number;
  // Campos adicionales devueltos por la función FN_GET_PROPERTIES_BY_HOST
  MAIN_IMAGE_URL?: string;
  AVERAGE_RATING?: number;
}

interface OracleImageRow {
  URL?: string;
  CAPTION?: string;
}

interface OracleAmenityRow {
  NAME?: string;
  CODE?: string;
  DESCRIPTION?: string;
}

interface OracleReviewRow {
  RATING?: number;
  COMMENTS?: string;
  CREATED_AT?: string | Date;
  AUTHOR_FIRST_NAME?: string;
  AUTHOR_LAST_NAME?: string;
}

interface OracleReviewsSummary {
  TOTAL_COUNT?: number;
  AVERAGE_RATING?: number;
}

export class PropertyService {
  /**
   * Helper para procesar datos de Oracle de manera segura y evitar referencias circulares
   */
  private static async processOracleData(data: unknown): Promise<unknown> {
    if (data === null || data === undefined) {
      return data;
    }

    // Si es un Date, convertir a string
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Si es un número o string básico, retornar tal cual
    if (
      typeof data === "number" ||
      typeof data === "string" ||
      typeof data === "boolean"
    ) {
      return data;
    }

    // Si es un array, procesar cada elemento
    if (Array.isArray(data)) {
      const processedArray = [];
      for (const item of data) {
        processedArray.push(await this.processOracleData(item));
      }
      return processedArray;
    }

    // Si es un objeto, verificar si es un CLOB/BLOB
    if (typeof data === "object") {
      // Type guard para LOB de Oracle
      const isOracleLob = (obj: unknown): obj is OracleLob => {
        return (
          typeof obj === "object" &&
          obj !== null &&
          "getData" in obj &&
          typeof (obj as OracleLob).getData === "function"
        );
      };

      // Verificar si es un LOB (CLOB/BLOB) de Oracle
      if (isOracleLob(data)) {
        try {
          const lobData = await data.getData();
          return typeof lobData === "string" ? lobData : String(lobData || "");
        } catch (error) {
          console.warn("Error reading LOB data:", error);
          return "";
        }
      }

      // Type guard para objeto tipo LOB
      const hasLobProperties = (
        obj: unknown
      ): obj is {
        allowHalfOpen?: boolean;
        offset?: number;
        toString?: () => string;
      } => {
        return (
          typeof obj === "object" &&
          obj !== null &&
          ("allowHalfOpen" in obj || "offset" in obj)
        );
      };

      // Si parece ser un objeto CLOB/BLOB basado en sus propiedades
      if (hasLobProperties(data)) {
        try {
          // Intentar convertir usando toString si está disponible
          if (typeof data.toString === "function") {
            const stringValue = data.toString();
            if (stringValue && stringValue !== "[object Object]") {
              return stringValue;
            }
          }
          console.warn(
            "Found CLOB-like object but could not convert to string:",
            data
          );
          return "";
        } catch (error) {
          console.warn("Error converting CLOB-like object:", error);
          return "";
        }
      }

      // Procesar objeto normal
      const result: Record<string, unknown> = {};

      // Type guard para objeto indexable
      const isIndexableObject = (
        obj: unknown
      ): obj is Record<string, unknown> => {
        return typeof obj === "object" && obj !== null && !Array.isArray(obj);
      };

      if (isIndexableObject(data)) {
        // Solo copiar propiedades propias del objeto
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];

            // Evitar propiedades que pueden causar referencias circulares
            if (
              key.startsWith("_") ||
              key === "constructor" ||
              key === "prototype" ||
              typeof value === "function"
            ) {
              continue;
            }

            result[key] = await this.processOracleData(value);
          }
        }
      }

      return result;
    }

    return data;
  }

  /**
   * Helper para mapear resultados de Oracle que pueden venir como arrays
   */
  private static async mapOracleResults(
    result: oracledb.Result<unknown>
  ): Promise<Record<string, unknown>[]> {
    console.log("mapOracleResults input:", {
      hasResult: !!result,
      hasRows: !!result?.rows,
      rowsLength: result?.rows?.length,
      firstRowType: typeof result?.rows?.[0],
      isFirstRowArray: Array.isArray(result?.rows?.[0]),
    });

    if (!result.rows || result.rows.length === 0) {
      console.log("mapOracleResults: No rows found, returning empty array");
      return [];
    }

    if (Array.isArray(result.rows[0])) {
      console.log("mapOracleResults: Processing array format");
      // Los datos vienen como arrays, mapear usando metaData
      const metaData = result.metaData as oracledb.Metadata<unknown>[];
      const mapped = [];

      for (const row of result.rows) {
        // Type guard para array
        if (!Array.isArray(row)) continue;

        const obj: Record<string, unknown> = {};

        for (let i = 0; i < metaData.length; i++) {
          const columnName = metaData[i].name;
          let value = row[i];

          // Si es un LOB, leerlo
          if (
            value &&
            typeof value === "object" &&
            value._type &&
            (value._type.toString().includes("CLOB") ||
              value._type.toString().includes("BLOB"))
          ) {
            try {
              value = await value.getData();
            } catch (error) {
              console.warn(
                `Error reading LOB for column ${columnName}:`,
                error
              );
              value = null;
            }
          }

          obj[columnName] = value;
          // También agregar versión lowercase s compatibilidad
          obj[columnName.toLowerCase()] = value;
        }

        console.log("Mapped object keys:", Object.keys(obj));
        console.log("Sample mapped object properties:", {
          PROPERTY_ID: obj.PROPERTY_ID,
          TITLE: obj.TITLE,
          HOST_ID: obj.HOST_ID,
        });
        mapped.push(obj);
      }

      console.log(
        "mapOracleResults: Mapped array format, result length:",
        mapped.length
      );
      return mapped;
    } else {
      console.log("mapOracleResults: Processing object format");
      // Los datos ya vienen como objetos
      return result.rows as Record<string, unknown>[];
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
        out_reviews_summary_cur: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
        out_reviews_list_cursor: {
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
        out_details_cursor?: oracledb.ResultSet<unknown>;
        out_images_cursor?: oracledb.ResultSet<unknown>;
        out_amenities_cursor?: oracledb.ResultSet<unknown>;
        out_reviews_summary_cur?: oracledb.ResultSet<unknown>;
        out_reviews_list_cursor?: oracledb.ResultSet<unknown>;
        out_error_code?: string;
      };

      if (outBinds?.out_error_code) {
        throw new Error(outBinds.out_error_code);
      }

      // Procesar cursor de detalles
      const detailsCursor = outBinds?.out_details_cursor;
      let detailsRow: OraclePropertyRow | null = null;
      if (detailsCursor) {
        const rawRow = await detailsCursor.getRow();
        const processedRow = rawRow
          ? await this.processOracleData(rawRow)
          : null;
        detailsRow = processedRow as OraclePropertyRow;
        await detailsCursor.close();
      }

      if (!detailsRow) {
        throw new Error("Propiedad no encontrada");
      }

      // Procesar cursor de imágenes
      const imagesCursor = outBinds?.out_images_cursor;
      const images: PropertyImage[] = [];
      if (imagesCursor) {
        let imageRow;
        let imageIndex = 0;
        while ((imageRow = await imagesCursor.getRow())) {
          const processedImageRow = (await this.processOracleData(
            imageRow
          )) as OracleImageRow;
          images.push({
            id: imageIndex++,
            url: processedImageRow.URL || "",
            alt: processedImageRow.CAPTION || "",
            isPrimary: imageIndex === 1,
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
          const processedAmenityRow = (await this.processOracleData(
            amenityRow
          )) as OracleAmenityRow;
          amenities.push({
            name: processedAmenityRow.NAME || "",
            icon: processedAmenityRow.CODE || "",
            description: processedAmenityRow.DESCRIPTION || "",
          });
        }
        await amenitiesCursor.close();
      }

      // Procesar cursor de resumen de reviews
      const reviewsSummaryCursor = outBinds?.out_reviews_summary_cur;
      let reviewsSummary: OracleReviewsSummary = {
        TOTAL_COUNT: 0,
        AVERAGE_RATING: 0,
      };
      if (reviewsSummaryCursor) {
        const rawSummaryRow = await reviewsSummaryCursor.getRow();
        if (rawSummaryRow) {
          reviewsSummary = (await this.processOracleData(
            rawSummaryRow
          )) as OracleReviewsSummary;
        }
        await reviewsSummaryCursor.close();
      }

      // Procesar cursor de lista de reviews
      const reviewsListCursor = outBinds?.out_reviews_list_cursor;
      const reviewsList: PropertyReview[] = [];
      if (reviewsListCursor) {
        let reviewRow;
        while ((reviewRow = await reviewsListCursor.getRow())) {
          const processedReviewRow = (await this.processOracleData(
            reviewRow
          )) as OracleReviewRow;
          reviewsList.push({
            rating: processedReviewRow.RATING || 0,
            comment: processedReviewRow.COMMENTS || "",
            createdAt:
              typeof processedReviewRow.CREATED_AT === "string"
                ? processedReviewRow.CREATED_AT
                : processedReviewRow.CREATED_AT instanceof Date
                  ? processedReviewRow.CREATED_AT.toISOString()
                  : "",
            authorName:
              `${processedReviewRow.AUTHOR_FIRST_NAME || ""} ${processedReviewRow.AUTHOR_LAST_NAME || ""}`.trim(),
          });
        }
        await reviewsListCursor.close();
      }

      // Construir el objeto PropertyDetail
      const propertyDetail: PropertyDetail = {
        propertyId: propertyId,
        hostId: detailsRow.HOST_ID || 0,
        title: detailsRow.TITLE || "",
        propertyType: detailsRow.PROPERTY_TYPE || "",
        basePriceNight: detailsRow.BASE_PRICE_NIGHT || 0,
        currencyCode: detailsRow.CURRENCY_CODE || "USD",
        addressText: detailsRow.FORMATTED_ADDRESS || "",
        city: detailsRow.CITY || "",
        stateRegion: detailsRow.STATE_REGION || "",
        country: detailsRow.COUNTRY || "",
        postalCode: "",
        latitude: detailsRow.LATITUDE || 0,
        longitude: detailsRow.LONGITUDE || 0,
        isActive: true,
        descriptionLong: detailsRow.DESCRIPTION_LONG || "",
        houseRules: detailsRow.HOUSE_RULES || "",
        checkinTime: detailsRow.CHECKIN_TIME || "",
        checkoutTime: detailsRow.CHECKOUT_TIME || "",
        capacity: detailsRow.CAPACITY || 0,
        bedrooms: detailsRow.BEDROOMS || 0,
        bathrooms: detailsRow.BATHROOMS || 0,
        beds: detailsRow.BEDS || 0,
        host: {
          id: detailsRow.HOST_ID || 0,
          name: `${detailsRow.HOST_FIRST_NAME || ""} ${detailsRow.HOST_LAST_NAME || ""}`.trim(),
          memberSince:
            typeof detailsRow.HOST_JOINED_AT === "string"
              ? detailsRow.HOST_JOINED_AT
              : detailsRow.HOST_JOINED_AT instanceof Date
                ? detailsRow.HOST_JOINED_AT.toISOString()
                : "",
          isVerified: detailsRow.HOST_IS_VERIFIED === 1,
        },
        amenities,
        images,
        reviews: {
          totalCount: reviewsSummary.TOTAL_COUNT || 0,
          averageRating: reviewsSummary.AVERAGE_RATING || 0,
          reviewsList,
        },
      };

      return propertyDetail;
    } catch (err) {
      console.error("Error al obtener la propiedad:", err);
      if (
        err instanceof Error &&
        err.message.includes("Propiedad no encontrada")
      ) {
        throw err;
      }
      throw new Error("No se pudo cargar el detalle de la propiedad.");
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
          dir: oracledb.BIND_IN,
        },
        // Campos de PROPERTIES (opcionales)
        P_TITLE: {
          val: data.title ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_BASE_PRICE_NIGHT: {
          val: data.basePriceNight ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        P_ADDRESS_TEXT: {
          val: data.addressText ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_CITY: {
          val: data.city ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_STATE_REGION: {
          val: data.stateRegion ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_COUNTRY: {
          val: data.country ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_POSTAL_CODE: {
          val: data.postalCode ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_LATITUDE: {
          val: data.latitude ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        P_LONGITUDE: {
          val: data.longitude ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        // Campos de PROPERTY_DETAILS (opcionales)
        P_DESCRIPTION_LONG: {
          val: data.descriptionLong ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_HOUSE_RULES: {
          val: data.houseRules ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_CHECKIN_TIME: {
          val: data.checkinTime ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_CHECKOUT_TIME: {
          val: data.checkoutTime ?? null,
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
        },
        P_CAPACITY: {
          val: data.capacity ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        P_BEDROOMS: {
          val: data.bedrooms ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        P_BATHROOMS: {
          val: data.bathrooms ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        P_BEDS: {
          val: data.beds ?? null,
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
        },
        // Parámetro de salida
        OUT_ERROR_CODE: {
          type: oracledb.STRING,
          dir: oracledb.BIND_OUT,
          maxSize: 4000,
        },
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
      const errorCode = (result.outBinds as { OUT_ERROR_CODE?: string })
        ?.OUT_ERROR_CODE;

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
          console.error("Error al cerrar la conexión:", err);
        }
      }
    }
  }

  /**
   * Obtiene los datos de una propiedad para el formulario de edición
   * @param propertyId - ID de la propiedad a obtener
   * @returns Promise con los datos de la propiedad para edición
   */
  static async getPropertyForEdit(
    propertyId: number
  ): Promise<UpdatePropertyBody> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      // Consulta SQL para obtener los datos de la propiedad
      const query = `
        SELECT 
          p.TITLE,
          p.BASE_PRICE_NIGHT,
          p.ADDRESS_TEXT,
          p.CITY,
          p.STATE_REGION,
          p.COUNTRY,
          p.POSTAL_CODE,
          p.LATITUDE,
          p.LONGITUDE,
          pd.DESCRIPTION_LONG,
          pd.HOUSE_RULES,
          pd.CHECKIN_TIME,
          pd.CHECKOUT_TIME,
          pd.CAPACITY,
          pd.BEDROOMS,
          pd.BATHROOMS,
          pd.BEDS
        FROM PROPERTIES p
        LEFT JOIN PROPERTY_DETAILS pd ON p.PROPERTY_ID = pd.PROPERTY_ID
        WHERE p.PROPERTY_ID = :propertyId
      `;

      const result = await connection.execute<Record<string, unknown>>(
        query,
        { propertyId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Propiedad no encontrada");
      }

      const row = result.rows[0];

      // Procesar CLOBs si es necesario
      const processedRow = (await this.processOracleData(row)) as Record<
        string,
        unknown
      >;

      // Mapear los datos al formato UpdatePropertyBody
      const propertyData: UpdatePropertyBody = {
        title: (processedRow.TITLE as string) || "",
        basePriceNight: Number(processedRow.BASE_PRICE_NIGHT) || 0,
        addressText: (processedRow.ADDRESS_TEXT as string) || "",
        city: (processedRow.CITY as string) || "",
        stateRegion: (processedRow.STATE_REGION as string) || "",
        country: (processedRow.COUNTRY as string) || "",
        postalCode: (processedRow.POSTAL_CODE as string) || "",
        latitude: Number(processedRow.LATITUDE) || 0,
        longitude: Number(processedRow.LONGITUDE) || 0,
        descriptionLong: (processedRow.DESCRIPTION_LONG as string) || "",
        houseRules: (processedRow.HOUSE_RULES as string) || "",
        checkinTime: (processedRow.CHECKIN_TIME as string) || "",
        checkoutTime: (processedRow.CHECKOUT_TIME as string) || "",
        capacity: Number(processedRow.CAPACITY) || 1,
        bedrooms: Number(processedRow.BEDROOMS) || 1,
        bathrooms: Number(processedRow.BATHROOMS) || 1,
        beds: Number(processedRow.BEDS) || 1,
      };

      return propertyData;
    } catch (err) {
      console.error("Error al obtener la propiedad para edición:", err);
      if (
        err instanceof Error &&
        err.message.includes("Propiedad no encontrada")
      ) {
        throw err;
      }
      throw new Error("No se pudo cargar los datos de la propiedad.");
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

  static async persistPhotoUrl(
    propertyId: number,
    photoUrl: string,
    caption: string,
    sortOrder: number
  ): Promise<void> {
    const sql = `
      INSERT INTO PROPERTY_IMAGES (PROPERTY_ID, URL, CAPTION, SORT_ORDER)
      VALUES (:propertyId, :photoUrl, :caption, :sortOrder)
    `;

    const binds = {
      propertyId: propertyId,
      photoUrl: photoUrl,
      caption: caption,
      sortOrder: sortOrder,
    };

    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(sql, binds, { autoCommit: true });

      if (result.rowsAffected !== 1) {
        console.log(
          "Se esperaba insertar 1 fila, pero se insertaron:",
          result.rowsAffected
        );
        throw new Error("No se pudo guardar la imagen de la propiedad.");
      }
    } catch (error) {
      console.log(
        "ERROR en property.service.ts: Fallo al persistir la URL en Oracle:",
        error
      );
      throw new Error(
        "Error al guardar la imagen de la propiedad: " +
          (error as Error).message
      );
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error al cerrar la conexión a Oracle:", err);
        }
      }
    }
  }

  static async getPropertyByHost(hostId: number): Promise<PropertyDetail[]> {
    let connection: oracledb.Connection | undefined;
    try {
      connection = await getConnection();

      const plsql = `
        BEGIN
          :out_properties_cursor := PROPERTY_PKG.FN_GET_PROPERTIES_BY_HOST(:p_host_id);
        END;
      `;

      const bindParams: oracledb.BindParameters = {
        p_host_id: {
          val: hostId,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        out_properties_cursor: {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        },
      };

      const result = await connection.execute(plsql, bindParams, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchArraySize: 100,
      });

      const outBinds = result.outBinds as {
        out_properties_cursor?: oracledb.ResultSet<unknown>;
      };

      const propertiesCursor = outBinds?.out_properties_cursor;
      const properties: PropertyDetail[] = [];

      if (propertiesCursor) {
        // Leer en batches para evitar usar demasiada memoria en listas grandes
        let rows: unknown[] = [];
        do {
          rows = await propertiesCursor.getRows(100); // máximo 100 por lectura

          for (const rawRow of rows) {
            const processedRow = (await this.processOracleData(
              rawRow
            )) as OraclePropertyRow;

            const propertySummary: PropertyDetail = {
              propertyId: processedRow.PROPERTY_ID || 0,
              hostId: processedRow.HOST_ID || 0,
              title: processedRow.TITLE || "",
              propertyType: processedRow.PROPERTY_TYPE || "",
              basePriceNight: processedRow.BASE_PRICE_NIGHT || 0,
              currencyCode: processedRow.CURRENCY_CODE || "USD",
              addressText: processedRow.FORMATTED_ADDRESS || "",
              city: processedRow.CITY || "",
              stateRegion: processedRow.STATE_REGION || "",
              country: processedRow.COUNTRY || "",
              postalCode: "",
              latitude: processedRow.LATITUDE || 0,
              longitude: processedRow.LONGITUDE || 0,
              createdAt: "",
              updatedAt: "",
              isActive: true,
              descriptionLong: processedRow.DESCRIPTION_LONG || "",
              houseRules: processedRow.HOUSE_RULES || "",
              checkinTime: processedRow.CHECKIN_TIME || "",
              checkoutTime: processedRow.CHECKOUT_TIME || "",
              capacity: processedRow.CAPACITY || 0,
              bedrooms: processedRow.BEDROOMS || 0,
              bathrooms: processedRow.BATHROOMS || 0,
              beds: processedRow.BEDS || 0,
              host: {
                id: processedRow.HOST_ID || 0,
                name: `${processedRow.HOST_FIRST_NAME || ""} ${processedRow.HOST_LAST_NAME || ""}`.trim(),
                memberSince:
                  typeof processedRow.HOST_JOINED_AT === "string"
                    ? processedRow.HOST_JOINED_AT
                    : processedRow.HOST_JOINED_AT instanceof Date
                      ? processedRow.HOST_JOINED_AT.toISOString()
                      : "",
                isVerified: processedRow.HOST_IS_VERIFIED === 1,
              },
              amenities: [],
              images: processedRow.MAIN_IMAGE_URL
                ? [
                    {
                      id: 0,
                      url: processedRow.MAIN_IMAGE_URL,
                      alt: "",
                      isPrimary: true,
                    },
                  ]
                : [],
              reviews: {
                totalCount: 0,
                averageRating: processedRow.AVERAGE_RATING || 0,
                reviewsList: [],
              },
            } as PropertyDetail;

            properties.push(propertySummary);
          }
        } while (rows && rows.length > 0);

        try {
          await propertiesCursor.close();
        } catch (err) {
          console.warn("No se pudo cerrar propertiesCursor:", err);
        }
      }

      return properties;
    } catch (error) {
      console.log(
        "ERROR en property.service.ts: Fallo al obtener las propiedades del host desde Oracle:",
        error
      );
      throw new Error(
        "Error al obtener las propiedades del host: " + (error as Error).message
      );
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error al cerrar la conexión a Oracle:", err);
        }
      }
    }
  }
}
