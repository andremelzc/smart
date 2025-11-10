import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import type { NotificationItem, NotificationRole, NotificationStatus } from "@/src/types/dtos/notifications.dto";
import oracledb from "oracledb";

interface OracleClob {
  getData(): Promise<Buffer>;
}

type RawNotificationRow = {
  BOOKING_ID: number;
  PROPERTY_TITLE: string;
  STATUS: string;
  CREATED_AT: Date | null;
  ACCEPTED_AT: Date | null;
  DECLINED_AT: Date | null;
  COMPLETED_AT: Date | null;
  CHECKIN_DATE: Date;
  CHECKOUT_DATE: Date;
  TOTAL_AMOUNT: number;
  CURRENCY_CODE: string;
  HOST_NOTE: string | OracleClob | null;
  TENANT_NOTE: string | OracleClob | null;
  ROLE_TAG: string;
  HOST_NAME: string | null;
  TENANT_NAME: string | null;
};

const ROLE_HOST: NotificationRole = "host";
const ROLE_TENANT: NotificationRole = "tenant";

const STATUS_PRIORITY: Record<NotificationStatus, number> = {
  PENDING: 1,
  ACCEPTED: 2,
  DECLINED: 3,
  CANCELLED: 4,
  COMPLETED: 5,
};
const canonicaliseStatus = (status: string): NotificationStatus => {
  const upper = status.toUpperCase();
  switch (upper) {
    case 'ACCEPTED':
    case 'CONFIRMED':
      return 'ACCEPTED';
    case 'DECLINED':
    case 'REJECTED':
      return 'DECLINED';
    case 'CANCELLED':
    case 'CANCELED':
      return 'CANCELLED';
    case 'COMPLETED':
    case 'FINISHED':
      return 'COMPLETED';
    default:
      return 'PENDING';
  }
};

const normaliseClob = async (value: string | OracleClob | null) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    const buffer = await value.getData();
    return buffer.toString();
  } catch (error) {
    console.error("Error leyendo CLOB de notificacion:", error);
    return null;
  }
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const mapRowToNotification = async (row: RawNotificationRow): Promise<NotificationItem> => {
  const status = canonicaliseStatus(row.STATUS || '');
  let eventAt: Date | null = null;

  switch (status) {
    case "ACCEPTED":
      eventAt = row.ACCEPTED_AT;
      break;
    case "DECLINED":
      eventAt = row.DECLINED_AT;
      break;
    case "COMPLETED":
      eventAt = row.COMPLETED_AT;
      break;
    case "CANCELLED":
      eventAt = row.DECLINED_AT || row.ACCEPTED_AT || row.CREATED_AT;
      break;
    default:
      eventAt = row.CREATED_AT;
  }

  return {
    bookingId: row.BOOKING_ID,
    propertyTitle: row.PROPERTY_TITLE,
    status,
    createdAt: toIsoString(row.CREATED_AT),
    eventAt: toIsoString(eventAt),
  checkinDate: toIsoString(row.CHECKIN_DATE) ?? new Date(row.CHECKIN_DATE).toISOString(),
  checkoutDate: toIsoString(row.CHECKOUT_DATE) ?? new Date(row.CHECKOUT_DATE).toISOString(),
    totalAmount: row.TOTAL_AMOUNT,
    currencyCode: row.CURRENCY_CODE,
    role: row.ROLE_TAG === ROLE_HOST ? ROLE_HOST : ROLE_TENANT,
    hostName: row.HOST_NAME,
    tenantName: row.TENANT_NAME,
    hostNote: await normaliseClob(row.HOST_NOTE),
    tenantNote: await normaliseClob(row.TENANT_NOTE),
  };
};

const CHECKIN_REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

const applyReminderMetadata = (notification: NotificationItem): NotificationItem => {
  if (notification.status !== "ACCEPTED") {
    return notification;
  }

  if (!notification.checkinDate) {
    return notification;
  }

  const checkinTime = new Date(notification.checkinDate).getTime();
  if (!Number.isFinite(checkinTime)) {
    return notification;
  }

  const now = Date.now();
  const diffMs = checkinTime - now;

  if (diffMs <= 0 || diffMs > CHECKIN_REMINDER_WINDOW_MS) {
    return notification;
  }

  return {
    ...notification,
    reminderType: "CHECKIN_24H",
  };
};

const orderNotifications = (items: NotificationItem[]) =>
  [...items].sort((a, b) => {
    const statusDelta = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }
    const dateA = a.eventAt ? new Date(a.eventAt).getTime() : 0;
    const dateB = b.eventAt ? new Date(b.eventAt).getTime() : 0;
    return dateB - dateA;
  });

export async function GET(request: NextRequest) {
  let connection: oracledb.Connection | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Identificador de usuario no valido" }, { status: 400 });
    }

    const roleParam = request.nextUrl.searchParams.get("role")?.toLowerCase();
    const requestedRole = roleParam === ROLE_HOST || roleParam === ROLE_TENANT ? roleParam : null;

    connection = await getConnection();

    const queries: Array<{ role: NotificationRole; sql: string; binds: oracledb.BindParameters }> = [];

    if (!requestedRole || requestedRole === ROLE_HOST) {
      queries.push({
        role: ROLE_HOST,
        sql: `SELECT b.booking_id,
                     p.title AS property_title,
                     b.status,
                     b.created_at,
                     b.accepted_at,
                     b.declined_at,
                     b.completed_at,
                     b.checkin_date,
                     b.checkout_date,
                     b.total_amount,
                     b.currency_code,
                     b.host_note,
                     b.tenant_note,
                     'host' AS role_tag,
                     (SELECT TRIM(first_name || ' ' || NVL(last_name, ''))
                        FROM users u
                       WHERE u.user_id = p.host_id) AS host_name,
                     (SELECT TRIM(first_name || ' ' || NVL(last_name, ''))
                        FROM users u
                       WHERE u.user_id = b.tenant_id) AS tenant_name
                FROM bookings b
                JOIN properties p ON p.property_id = b.property_id
               WHERE p.host_id = :userId`,
        binds: { userId },
      });
    }

    if (!requestedRole || requestedRole === ROLE_TENANT) {
      queries.push({
        role: ROLE_TENANT,
        sql: `SELECT b.booking_id,
                     p.title AS property_title,
                     b.status,
                     b.created_at,
                     b.accepted_at,
                     b.declined_at,
                     b.completed_at,
                     b.checkin_date,
                     b.checkout_date,
                     b.total_amount,
                     b.currency_code,
                     b.host_note,
                     b.tenant_note,
                     'tenant' AS role_tag,
                     (SELECT TRIM(first_name || ' ' || NVL(last_name, ''))
                        FROM users u
                       WHERE u.user_id = p.host_id) AS host_name,
                     (SELECT TRIM(first_name || ' ' || NVL(last_name, ''))
                        FROM users u
                       WHERE u.user_id = b.tenant_id) AS tenant_name
                FROM bookings b
                JOIN properties p ON p.property_id = b.property_id
               WHERE b.tenant_id = :userId`,
        binds: { userId },
      });
    }

    const notificationResults: NotificationItem[] = [];

    for (const query of queries) {
      const result = await connection.execute(query.sql, query.binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      const rows = result.rows as RawNotificationRow[] | undefined;
      if (rows && rows.length > 0) {
        for (const row of rows) {
          const enriched: RawNotificationRow = { ...row, ROLE_TAG: query.role } as RawNotificationRow;
          const notification = await mapRowToNotification(enriched);
          notificationResults.push(applyReminderMetadata(notification));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: orderNotifications(notificationResults),
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json({ error: "No se pudieron obtener las notificaciones" }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexion:", closeError);
      }
    }
  }
}
