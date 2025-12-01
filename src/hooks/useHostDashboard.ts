/**
 * ========================================
 * HOOK: useHostDashboard
 * ========================================
 * Hook para obtener las estadísticas del dashboard del host
 */

import { useState, useEffect } from 'react';
import type { HostDashboardStats, HostRecentActivity } from '@/src/types/dtos/dashboard.dto';

interface UseHostDashboardResult {
  stats: HostDashboardStats | null;
  recentActivity: HostRecentActivity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHostDashboard(): UseHostDashboardResult {
  const [stats, setStats] = useState<HostDashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<HostRecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/host/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener datos del dashboard');
      }

      setStats(result.data.stats);
      setRecentActivity(result.data.recentActivity);
    } catch (err) {
      console.error('❌ Error en useHostDashboard:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
