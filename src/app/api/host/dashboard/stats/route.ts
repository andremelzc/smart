/**
 * ========================================
 * API ROUTE: GET /api/host/dashboard/stats
 * ========================================
 * Obtiene las estadísticas del dashboard del host
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { getConnection, oracledb } from '@/src/lib/database';
import type { HostDashboardResponse, HostDashboardStats, HostRecentActivity } from '@/src/types/dtos/dashboard.dto';

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea host
    if (!session.user.isHost) {
      return NextResponse.json(
        { success: false, message: 'Usuario no es anfitrión' },
        { status: 403 }
      );
    }

    const hostId = Number(session.user.id);

    // Conectar a la base de datos
    const connection = await getConnection();

    try {
      // 1. Obtener estadísticas generales
      const statsResult = await connection.execute(
        `BEGIN
          HOST_DASHBOARD_PKG.GET_HOST_STATS(
            p_host_id => :p_host_id,
            p_stats_cursor => :p_stats_cursor
          );
        END;`,
        {
          p_host_id: hostId,
          p_stats_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );

      const statsOutBinds = statsResult.outBinds as {
        p_stats_cursor?: oracledb.ResultSet<unknown>;
      };

      let stats: HostDashboardStats = {
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        averageTicket: 0,
        totalReviews: 0,
        totalProperties: 0,
        activeBookings: 0,
      };

      if (statsOutBinds.p_stats_cursor) {
        try {
          const rows = await statsOutBinds.p_stats_cursor.getRows(1);

          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0] as Record<string, unknown>;

            stats = {
              totalBookings: Number(row.TOTAL_BOOKINGS) || 0,
              totalRevenue: Number(row.TOTAL_REVENUE) || 0,
              averageRating: Number(row.AVERAGE_RATING) || 0,
              averageTicket: Number(row.AVERAGE_TICKET) || 0,
              totalReviews: Number(row.TOTAL_REVIEWS) || 0,
              totalProperties: Number(row.TOTAL_PROPERTIES) || 0,
              activeBookings: Number(row.ACTIVE_BOOKINGS) || 0,
            };
          }
        } finally {
          await statsOutBinds.p_stats_cursor.close();
        }
      }

      // 2. Obtener actividad reciente
      const activityResult = await connection.execute(
        `BEGIN
          HOST_DASHBOARD_PKG.GET_HOST_RECENT_ACTIVITY(
            p_host_id => :p_host_id,
            p_activity_cursor => :p_activity_cursor,
            p_limit => :p_limit
          );
        END;`,
        {
          p_host_id: hostId,
          p_activity_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          p_limit: 10,
        }
      );

      const activityOutBinds = activityResult.outBinds as {
        p_activity_cursor?: oracledb.ResultSet<unknown>;
      };

      const recentActivity: HostRecentActivity[] = [];

      if (activityOutBinds.p_activity_cursor) {
        try {
          const rows = await activityOutBinds.p_activity_cursor.getRows(10);

          if (Array.isArray(rows)) {
            for (const row of rows) {
              const rowData = row as Record<string, unknown>;

              recentActivity.push({
                activityType: String(rowData.ACTIVITY_TYPE) as 'booking' | 'review' | 'payment',
                activityId: Number(rowData.ACTIVITY_ID),
                title: String(rowData.TITLE),
                description: String(rowData.DESCRIPTION),
                activityDate: rowData.ACTIVITY_DATE
                  ? new Date(String(rowData.ACTIVITY_DATE)).toISOString()
                  : new Date().toISOString(),
                status: String(rowData.STATUS),
              });
            }
          }
        } finally {
          await activityOutBinds.p_activity_cursor.close();
        }
      }

      const response: HostDashboardResponse = {
        success: true,
        data: {
          stats,
          recentActivity,
        },
      };

      return NextResponse.json(response);
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('❌ Error en GET /api/host/dashboard/stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
