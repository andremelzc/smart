import oracledb from "oracledb";
import { getConnection } from "@/src/lib/database";

export type HighlightProperty = {
  propertyId: number;
  title: string;
  city: string;
  country: string | null;
  mainImageUrl: string | null;
  averageRating: number | null;
};

export type CityHighlight = {
  city: string;
  country: string | null;
  properties: HighlightProperty[];
};

const HIGHLIGHTS_QUERY = `
WITH TopCities AS (
    -- 1. Identificamos las ciudades con más propiedades (top 6)
    SELECT CITY
      FROM PROPERTIES
     GROUP BY CITY
     ORDER BY COUNT(*) DESC, CITY ASC
     FETCH FIRST 6 ROWS ONLY
),
PropRatings AS (
    -- 2. Pre-calculamos los ratings (1 fila por propiedad)
    SELECT PROPERTY_ID, AVG(RATING) AS AVG_RATING
      FROM REVIEWS
     GROUP BY PROPERTY_ID
),
MainImages AS (
    -- 3. Imagen principal de cada propiedad (SORT_ORDER = 0)
    SELECT PROPERTY_ID, URL
      FROM (
        SELECT PROPERTY_ID, URL,
               ROW_NUMBER() OVER (PARTITION BY PROPERTY_ID ORDER BY IMAGE_ID) AS rn
          FROM PROPERTY_IMAGES
         WHERE SORT_ORDER = 0
      )
     WHERE rn = 1
)
SELECT
    p.PROPERTY_ID,
    p.TITLE,
    p.CITY,
    p.COUNTRY,
    mi.URL AS MAIN_IMAGE_URL,
    pr.AVG_RATING
FROM PROPERTIES p
JOIN TopCities tc
  ON p.CITY = tc.CITY
LEFT JOIN MainImages mi
  ON p.PROPERTY_ID = mi.PROPERTY_ID
LEFT JOIN PropRatings pr
  ON p.PROPERTY_ID = pr.PROPERTY_ID
ORDER BY
    p.CITY,
    pr.AVG_RATING DESC NULLS LAST,
    p.TITLE`;

interface OracleHighlightRow {
  PROPERTY_ID?: number | string;
  TITLE?: string;
  CITY?: string;
  COUNTRY?: string;
  MAIN_IMAGE_URL?: string;
  AVG_RATING?: number | string | null;
}

export class HomeHighlightsService {
  static async getCityHighlights(): Promise<CityHighlight[]> {
    let connection: oracledb.Connection | undefined;

    try {
      connection = await getConnection();

      const result = await connection.execute<OracleHighlightRow>(
        HIGHLIGHTS_QUERY,
        [],
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );

      const rows = Array.isArray(result.rows) ? result.rows : [];
      const groups = new Map<string, CityHighlight>();

      for (const row of rows) {
        const city =
          typeof row.CITY === "string" && row.CITY.trim().length > 0
            ? row.CITY.trim()
            : "Otros";
        const country =
          typeof row.COUNTRY === "string" && row.COUNTRY.trim().length > 0
            ? row.COUNTRY.trim()
            : null;

        let highlight = groups.get(city);
        if (!highlight) {
          highlight = {
            city,
            country,
            properties: [],
          };
          groups.set(city, highlight);
        }

        const propertyIdRaw = row.PROPERTY_ID;
        const propertyId =
          typeof propertyIdRaw === "number"
            ? propertyIdRaw
            : Number(propertyIdRaw ?? 0);

        const averageRatingRaw = row.AVG_RATING;
        const averageRatingValue =
          typeof averageRatingRaw === "number"
            ? averageRatingRaw
            : typeof averageRatingRaw === "string" &&
                averageRatingRaw.trim().length > 0
              ? Number(averageRatingRaw)
              : null;

        const averageRating =
          typeof averageRatingValue === "number" &&
          Number.isFinite(averageRatingValue)
            ? averageRatingValue
            : null;

        highlight.properties.push({
          propertyId,
          title: typeof row.TITLE === "string" ? row.TITLE : "Propiedad",
          city,
          country,
          mainImageUrl:
            typeof row.MAIN_IMAGE_URL === "string" ? row.MAIN_IMAGE_URL : null,
          averageRating,
        });
      }

      return Array.from(groups.values());
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing Oracle connection:", error);
        }
      }
    }
  }
}
