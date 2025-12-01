import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { executeQuery, oracledb } from "@/src/lib/database";

export const dynamic = "force-dynamic";

// GET: List all conversations for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Query to fetch conversations for the user
    // We join CONVERSATION_PARTICIPANTS to find chats where the user is a participant
    // We also join PROPERTIES to get property details
    // We join BOOKINGS to get booking details
    // We need to find the "other" participant to show their name
    const sql = `
      SELECT 
        c.CONVERSATION_ID,
        c.PROPERTY_ID,
        c.BOOKING_ID,
        c.STATUS,
        c.CREATED_AT,
        p.TITLE as PROPERTY_TITLE,
        p.CITY as PROPERTY_CITY,
        p.COUNTRY as PROPERTY_COUNTRY,
        b.CHECKIN_DATE,
        b.CHECKOUT_DATE,
        b.GUEST_COUNT,
        -- Get the other participant's name
        (
          SELECT u.FIRST_NAME || ' ' || u.LAST_NAME 
          FROM CONVERSATION_PARTICIPANTS cp2
          JOIN USERS u ON cp2.USER_ID = u.USER_ID
          WHERE cp2.CONVERSATION_ID = c.CONVERSATION_ID 
          AND cp2.USER_ID != :userId
          FETCH FIRST 1 ROWS ONLY
        ) as OTHER_USER_NAME,
         -- Get the latest message content
        (
          SELECT m.CONTENT 
          FROM MESSAGES m 
          WHERE m.CONVERSATION_ID = c.CONVERSATION_ID 
          ORDER BY m.SENT_AT DESC 
          FETCH FIRST 1 ROWS ONLY
        ) as LATEST_MESSAGE_CONTENT,
        -- Get the latest message sender
        (
          SELECT m.AUTHOR_USER_ID 
          FROM MESSAGES m 
          WHERE m.CONVERSATION_ID = c.CONVERSATION_ID 
          ORDER BY m.SENT_AT DESC 
          FETCH FIRST 1 ROWS ONLY
        ) as LATEST_MESSAGE_SENDER_ID,
        -- Get the latest message timestamp
        (
          SELECT m.SENT_AT 
          FROM MESSAGES m 
          WHERE m.CONVERSATION_ID = c.CONVERSATION_ID 
          ORDER BY m.SENT_AT DESC 
          FETCH FIRST 1 ROWS ONLY
        ) as LATEST_MESSAGE_TIME
      FROM CONVERSATIONS c
      JOIN CONVERSATION_PARTICIPANTS cp ON c.CONVERSATION_ID = cp.CONVERSATION_ID
      LEFT JOIN PROPERTIES p ON c.PROPERTY_ID = p.PROPERTY_ID
      LEFT JOIN BOOKINGS b ON c.BOOKING_ID = b.BOOKING_ID
      WHERE cp.USER_ID = :userId
      ORDER BY LATEST_MESSAGE_TIME DESC NULLS LAST, c.CREATED_AT DESC
    `;

    const result = await executeQuery(sql, { userId });

    // Format the response to match the frontend expectations (or close to it)
    // Create completely new objects to avoid any Oracle metadata circular references
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversations = (result?.rows || []).map((row: any) => {
      // Helper to safely convert dates
      const toISOStringOrNull = (date: unknown): string | null => {
        if (!date) return null;
        try {
          if (date instanceof Date) {
            return date.toISOString();
          }
          // If it's already a string, return it
          if (typeof date === "string") {
            return new Date(date).toISOString();
          }
          return null;
        } catch {
          return null;
        }
      };

      const conversationData = {
        id: Number(row.CONVERSATION_ID) || 0,
        reservationId: row.BOOKING_ID ? `RES-${row.BOOKING_ID}` : null,
        hostName: String(row.OTHER_USER_NAME || "Usuario"),
        propertyName: String(row.PROPERTY_TITLE || ""),
        location:
          row.PROPERTY_CITY && row.PROPERTY_COUNTRY
            ? `${row.PROPERTY_CITY}, ${row.PROPERTY_COUNTRY}`
            : "",
        autoCreatedAt:
          toISOStringOrNull(row.CREATED_AT) || new Date().toISOString(),
        checkIn: toISOStringOrNull(row.CHECKIN_DATE),
        checkOut: toISOStringOrNull(row.CHECKOUT_DATE),
        guests: Number(row.GUEST_COUNT) || 0,
        status: String(row.STATUS || "open"),
        lastMessage: {
          content: String(row.LATEST_MESSAGE_CONTENT || ""),
          senderId: row.LATEST_MESSAGE_SENDER_ID
            ? Number(row.LATEST_MESSAGE_SENDER_ID)
            : null,
          timestamp: toISOStringOrNull(row.LATEST_MESSAGE_TIME),
        },
      };

      return conversationData;
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create or retrieve a conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { propertyId, bookingId, initialMessage } = await request.json();

    // Convert userId to number if it's a string
    const userIdNum =
      typeof userId === "string" ? parseInt(userId, 10) : userId;

    // Validate required fields
    if (!propertyId || typeof propertyId !== "number") {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // 1. Get the property owner (host)
    const propertyQuery = `
      SELECT HOST_ID 
      FROM PROPERTIES 
      WHERE PROPERTY_ID = :propertyId
    `;
    const propertyResult = await executeQuery(propertyQuery, { propertyId });

    if (!propertyResult?.rows || propertyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hostId = Number((propertyResult.rows[0] as any).HOST_ID);

    // Prevent self-conversation
    if (hostId == userIdNum) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // 2. Check if conversation already exists between these users for this property
    const existingConvoQuery = `
      SELECT c.CONVERSATION_ID
      FROM CONVERSATIONS c
      WHERE c.PROPERTY_ID = :propertyId
      AND EXISTS (
        SELECT 1 FROM CONVERSATION_PARTICIPANTS cp1
        WHERE cp1.CONVERSATION_ID = c.CONVERSATION_ID
        AND cp1.USER_ID = :userId
      )
      AND EXISTS (
        SELECT 1 FROM CONVERSATION_PARTICIPANTS cp2
        WHERE cp2.CONVERSATION_ID = c.CONVERSATION_ID
        AND cp2.USER_ID = :hostId
      )
      FETCH FIRST 1 ROWS ONLY
    `;

    const existingResult = await executeQuery(existingConvoQuery, {
      propertyId,
      userId: userIdNum,
      hostId,
    });

    // If conversation exists, return it
    if (existingResult?.rows && existingResult.rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingConvoId = (existingResult.rows[0] as any).CONVERSATION_ID;

      // If there's an initial message, send it
      if (
        initialMessage &&
        typeof initialMessage === "string" &&
        initialMessage.trim()
      ) {
        const insertMessageSql = `
          INSERT INTO MESSAGES (CONVERSATION_ID, AUTHOR_USER_ID, CONTENT)
          VALUES (:conversationId, :userId, :content)
        `;
        await executeQuery(insertMessageSql, {
          conversationId: existingConvoId,
          userId: userIdNum,
          content: initialMessage.trim(),
        });
      }

      return NextResponse.json({
        conversationId: existingConvoId,
        isNew: false,
      });
    }

    // 3. Create new conversation
    const createConvoSql = `
      INSERT INTO CONVERSATIONS (PROPERTY_ID, BOOKING_ID, STATUS)
      VALUES (:propertyId, :bookingId, 'open')
      RETURNING CONVERSATION_ID INTO :out_id
    `;

    const createConvoBinds = {
      propertyId,
      bookingId: bookingId || null,
      out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const createConvoResult = await executeQuery(
      createConvoSql,
      createConvoBinds
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newConvoId = (createConvoResult?.outBinds as any)?.out_id;

    if (!newConvoId) {
      throw new Error("Failed to create conversation");
    }

    // 4. Add participants (guest and host)
    // Insert guest participant
    const addGuestSql = `
      INSERT INTO CONVERSATION_PARTICIPANTS (CONVERSATION_ID, USER_ID, ROLE)
      VALUES (:conversationId, :userId, 'guest')
    `;
    await executeQuery(addGuestSql, {
      conversationId: Number(newConvoId),
      userId: userIdNum,
    });

    // Insert host participant
    const addHostSql = `
      INSERT INTO CONVERSATION_PARTICIPANTS (CONVERSATION_ID, USER_ID, ROLE)
      VALUES (:conversationId, :hostId, 'host')
    `;
    await executeQuery(addHostSql, {
      conversationId: Number(newConvoId),
      hostId: hostId,
    });

    // 5. Send initial message if provided
    if (
      initialMessage &&
      typeof initialMessage === "string" &&
      initialMessage.trim()
    ) {
      const insertMessageSql = `
        INSERT INTO MESSAGES (CONVERSATION_ID, AUTHOR_USER_ID, CONTENT)
        VALUES (:conversationId, :userId, :content)
      `;
      await executeQuery(insertMessageSql, {
        conversationId: Number(newConvoId),
        userId: userIdNum,
        content: initialMessage.trim(),
      });
    }

    return NextResponse.json({
      conversationId: newConvoId,
      isNew: true,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
