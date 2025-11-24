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
SELECT
    p.PROPERTY_ID,
    p.TITLE,
    p.CITY,
    p.COUNTRY,
    pi.URL AS MAIN_IMAGE_URL,
    AVG(r.RATING) AS AVG_RATING
FROM PROPERTIES p
JOIN (
    SELECT CITY
      FROM PROPERTIES
     GROUP BY CITY
     ORDER BY COUNT(*) DESC, CITY ASC
     FETCH FIRST 6 ROWS ONLY
) c
  ON c.CITY = p.CITY
LEFT JOIN (
    SELECT property_id, url
      FROM (
        SELECT property_id,
               url,
               ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY image_id) AS rn
          FROM PROPERTY_IMAGES
         WHERE SORT_ORDER = 0
      )
     WHERE rn = 1
) pi
  ON pi.PROPERTY_ID = p.PROPERTY_ID
LEFT JOIN REVIEWS r
  ON r.PROPERTY_ID = p.PROPERTY_ID
GROUP BY
    p.PROPERTY_ID,
    p.TITLE,
    p.CITY,
    p.COUNTRY,
    pi.URL
ORDER BY
  p.CITY,
  AVG_RATING DESC NULLS LAST,
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
