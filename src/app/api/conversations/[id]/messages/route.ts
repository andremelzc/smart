import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { executeQuery, oracledb } from "@/src/lib/database";

export const dynamic = "force-dynamic";

// GET: Fetch messages for a conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // 1. Verify user is a participant in this conversation
    const participantSql = `
      SELECT 1 
      FROM CONVERSATION_PARTICIPANTS 
      WHERE CONVERSATION_ID = :conversationId AND USER_ID = :userId
    `;
    const participantCheck = await executeQuery(participantSql, {
      conversationId,
      userId,
    });

    if (!participantCheck?.rows || participantCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch messages
    let messagesSql = `
      SELECT 
        m.MESSAGE_ID,
        m.AUTHOR_USER_ID,
        m.CONTENT,
        m.SENT_AT,
        m.IS_READ,
        u.FIRST_NAME,
        u.LAST_NAME
      FROM MESSAGES m
      JOIN USERS u ON m.AUTHOR_USER_ID = u.USER_ID
      WHERE m.CONVERSATION_ID = :conversationId
    `;

    const binds: oracledb.BindParameters = { conversationId };

    if (after) {
      messagesSql += ` AND m.SENT_AT > TO_TIMESTAMP_TZ(:after, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')`;
      (binds as Record<string, unknown>).after = after;
    }

    messagesSql += ` ORDER BY m.SENT_AT ASC FETCH FIRST :limit ROWS ONLY`;
    (binds as Record<string, unknown>).limit = limit;

    const result = await executeQuery(messagesSql, binds);

    // Helper to safely convert dates
    const toISOStringOrNull = (date: unknown): string | null => {
      if (!date) return null;
      try {
        if (date instanceof Date) {
          return date.toISOString();
        }
        if (typeof date === "string") {
          return new Date(date).toISOString();
        }
        return null;
      } catch {
        return null;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = (result?.rows || []).map((row: any) => {
      return {
        id: Number(row.MESSAGE_ID) || 0,
        senderId: Number(row.AUTHOR_USER_ID) || 0,
        senderName: `${row.FIRST_NAME || ""} ${row.LAST_NAME || ""}`.trim(),
        content: String(row.CONTENT || ""),
        timestamp: toISOStringOrNull(row.SENT_AT) || new Date().toISOString(),
        isRead: Number(row.IS_READ) === 1,
        isMe: Number(row.AUTHOR_USER_ID) === Number(userId),
      };
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.user.id;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // 1. Verify user is a participant
    const participantSql = `
      SELECT 1 
      FROM CONVERSATION_PARTICIPANTS 
      WHERE CONVERSATION_ID = :conversationId AND USER_ID = :userId
    `;
    const participantCheck = await executeQuery(participantSql, {
      conversationId,
      userId,
    });

    if (!participantCheck?.rows || participantCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Insert message
    const insertSql = `
      INSERT INTO MESSAGES (CONVERSATION_ID, AUTHOR_USER_ID, CONTENT)
      VALUES (:conversationId, :userId, :content)
      RETURNING MESSAGE_ID, SENT_AT INTO :out_id, :out_sent_at
    `;

    const binds = {
      conversationId,
      userId,
      content: content.trim(),
      out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_sent_at: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
    };

    const result = await executeQuery(insertSql, binds);

    // 3. Return the new message
    // Cast outBinds to any to avoid TS errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outBinds = result?.outBinds as any;
    const newMessageId = outBinds?.out_id;
    const sentAt = outBinds?.out_sent_at;

    // Safely convert sentAt to ISO string
    let sentAtISO: string;
    try {
      if (sentAt instanceof Date) {
        sentAtISO = sentAt.toISOString();
      } else if (typeof sentAt === "string") {
        sentAtISO = new Date(sentAt).toISOString();
      } else {
        sentAtISO = new Date().toISOString();
      }
    } catch {
      sentAtISO = new Date().toISOString();
    }

    return NextResponse.json({
      id: Number(newMessageId) || 0,
      senderId: Number(userId) || 0,
      content: content.trim(),
      timestamp: sentAtISO,
      isMe: true,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
