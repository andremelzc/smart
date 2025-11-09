export type NotificationRole = "host" | "tenant";

export type NotificationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED";

export interface NotificationItem {
  bookingId: number;
  propertyTitle: string;
  status: NotificationStatus;
  createdAt: string | null;
  eventAt?: string | null;
  checkinDate: string;
  checkoutDate: string;
  totalAmount: number;
  currencyCode: string;
  role: NotificationRole;
  hostName: string | null;
  tenantName: string | null;
  hostNote?: string | null;
  tenantNote?: string | null;
}
