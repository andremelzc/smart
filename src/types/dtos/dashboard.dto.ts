// ========================================
// DTOs PARA HOST DASHBOARD
// ========================================

/**
 * Estadísticas principales del dashboard del host
 */
export interface HostDashboardStats {
  // Métricas principales
  totalBookings: number;      // 📅 Reservas totales confirmadas
  totalRevenue: number;        // 💰 Ingresos totales generados
  averageRating: number;       // ⭐ Calificación promedio (1-5)
  averageTicket: number;       // 🎫 Ticket promedio por reserva
  
  // Métricas adicionales
  totalReviews: number;        // Total de reseñas recibidas
  totalProperties: number;     // Total de propiedades activas
  activeBookings: number;      // Reservas activas (confirmadas, no completadas)
}

/**
 * Tipo de actividad reciente
 */
export type ActivityType = 'booking' | 'review' | 'payment';

/**
 * Actividad reciente en el dashboard
 */
export interface HostRecentActivity {
  activityType: ActivityType;
  activityId: number;
  title: string;
  description: string;
  activityDate: string;        // ISO string
  status: string;
}

/**
 * Respuesta completa del dashboard
 */
export interface HostDashboardResponse {
  success: boolean;
  data: {
    stats: HostDashboardStats;
    recentActivity: HostRecentActivity[];
  };
  message?: string;
}

/**
 * Props para componentes de métricas individuales
 */
export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  isLoading?: boolean;
}
