import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  NotificationItem,
  NotificationRole,
  NotificationStatus,
} from "@/src/types/dtos/notifications.dto";

interface UseNotificationsOptions {
  role?: NotificationRole;
}

interface UseNotificationsResult {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateNotification: (
    bookingId: number,
    changes: Partial<NotificationItem>
  ) => void;
  availableRoles: NotificationRole[];
  statusCounts: Record<NotificationStatus, number>;
}

const buildUrl = (role?: NotificationRole) => {
  const base = "/api/account/notifications";
  if (!role) {
    return base;
  }
  const params = new URLSearchParams({ role });
  return `${base}?${params.toString()}`;
};

const deriveAvailableRoles = (items: NotificationItem[]): NotificationRole[] => {
  const roles = new Set<NotificationRole>();
  items.forEach((item) => roles.add(item.role));
  return Array.from(roles);
};

const deriveStatusCounts = (
  items: NotificationItem[]
): Record<NotificationStatus, number> => {
  const counts: Record<NotificationStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    DECLINED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
  };

  items.forEach((item) => {
    if (item.status in counts) {
      counts[item.status] += 1;
    }
  });

  return counts;
};

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsResult {
  const { role } = options;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildUrl(role), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error || "No se pudieron cargar las notificaciones";
        throw new Error(message);
      }

      const items: NotificationItem[] = Array.isArray(payload?.data)
        ? payload.data
        : [];
      setNotifications(items);
    } catch (err) {
      console.error("Error en useNotifications:", err);
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const updateNotification = useCallback(
    (bookingId: number, changes: Partial<NotificationItem>) => {
      setNotifications((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId ? { ...item, ...changes } : item
        )
      );
    },
    []
  );

  const availableRoles = useMemo(
    () => deriveAvailableRoles(notifications),
    [notifications]
  );

  const statusCounts = useMemo(
    () => deriveStatusCounts(notifications),
    [notifications]
  );

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
    updateNotification,
    availableRoles,
    statusCounts,
  };
}
