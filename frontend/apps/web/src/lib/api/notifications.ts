import { apiClient } from "./client";

export type MemberNotificationTone = "gold" | "green" | "amber" | "danger";
export type MemberNotificationCategory = "bill" | "booking" | "system";

export type MemberNotification = {
  id: string;
  templateKey: string;
  title: string;
  body: string;
  actionLabel: string;
  href: string;
  category: MemberNotificationCategory;
  tone: MemberNotificationTone;
  unread: boolean;
  createdAt: string;
  timeLabel: string;
  billId?: string | null;
  bookingId?: string | null;
  status?: string | null;
  bill?: {
    id: string;
    billNumber?: string | null;
    status?: string | null;
    totalVnd?: number | null;
    pointsEarned?: number | null;
    rejectReason?: string | null;
    storeName?: string | null;
  } | null;
};

export type MemberNotificationsResponse = {
  data: MemberNotification[];
  unreadCount: number;
};

export type MemberNotificationSocketPayload = {
  id?: string;
  templateKey?: string;
  category?: MemberNotificationCategory;
  bookingId?: string | null;
  billId?: string | null;
  createdAt?: string;
};

export const memberNotificationsRefreshEvent = "nightlife:member-notifications:refresh";
export const memberNotificationCreatedEvent = "nightlife:member-notification-created";

export const requestMemberNotificationsRefresh = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(memberNotificationsRefreshEvent));
};

export const notificationApi = {
  listMemberNotifications: (limit = 20) =>
    apiClient<MemberNotificationsResponse>("/member/notifications", {
      params: { limit },
    }),
  markMemberNotificationRead: (notificationId: string) =>
    apiClient<{ id: string; read: boolean }>(
      `/member/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: "PATCH" },
    ),
  markAllMemberNotificationsRead: () =>
    apiClient<{ updatedCount: number }>("/member/notifications/read-all", {
      method: "PATCH",
    }),
};
