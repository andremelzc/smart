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
    const messagesSql = `
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
      ORDER BY m.SENT_AT ASC
    `;

    const result = await executeQuery(messagesSql, { conversationId });

    interface MessageRow {
      MESSAGE_ID: number;
      AUTHOR_USER_ID: number;
      FIRST_NAME: string;
      LAST_NAME: string;
      CONTENT: string;
      SENT_AT: string;
      IS_READ: number;
    }

    const messages = (result?.rows || []).map((row: unknown) => {
      const r = row as MessageRow;
      return {
        id: r.MESSAGE_ID,
        senderId: r.AUTHOR_USER_ID,
        senderName: `${r.FIRST_NAME} ${r.LAST_NAME}`,
        content: r.CONTENT,
        timestamp: r.SENT_AT,
        isRead: r.IS_READ === 1,
        // Helper to determine if the message is from the current user (guest vs host logic handled in frontend)
        isMe: r.AUTHOR_USER_ID == Number(userId),
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

    return NextResponse.json({
      id: newMessageId,
      senderId: userId,
      content: content.trim(),
      timestamp: sentAt,
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
