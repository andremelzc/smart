import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { executeQuery } from "@/src/lib/database";

export const dynamic = "force-dynamic";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversations = (result?.rows || []).map((row: any) => ({
      id: row.CONVERSATION_ID,
      reservationId: row.BOOKING_ID ? `RES-${row.BOOKING_ID}` : null, // Frontend expects string ID
      hostName: row.OTHER_USER_NAME || "Usuario", // In a real app, distinguish Host vs Guest label
      propertyName: row.PROPERTY_TITLE,
      location: `${row.PROPERTY_CITY}, ${row.PROPERTY_COUNTRY}`,
      autoCreatedAt: row.CREATED_AT,
      checkIn: row.CHECKIN_DATE,
      checkOut: row.CHECKOUT_DATE,
      guests: row.GUEST_COUNT,
      status: row.STATUS,
      // We only return the latest message here for the list view
      lastMessage: {
        content: row.LATEST_MESSAGE_CONTENT,
        senderId: row.LATEST_MESSAGE_SENDER_ID,
        timestamp: row.LATEST_MESSAGE_TIME,
      },
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
