export const NOTIFICATION_TYPE = {
  PROPERTY_CREATED: 1,
  PROPERTY_APPROVED: 2,
  PROPERTY_REJECTED: 3,
  PROPERTY_NEED_MODIFICATION: 4,
  PROPERTY_ASSIGNED: 5,
  PROPERTY_TOKENIZED: 6,
  PROPERTY_WHITELISTED: 7,
  PROPERTY_WHITELIST_REJECTED: 8,
  IDENTITY_REQUEST_RECEIVED: 9,
  RENTAL_INCOME_RECEIVED: 10,
  CLAIM_REQUEST_RECEIVED: 11,
  CLAIM_REQUEST_APPROVED: 12,
  CLAIM_REQUEST_REJECTED: 13,
} as const;

export type NotificationTypeEnum =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface NotificationItem {
  id: string;
  notificationId: string;
  title: string;
  description: string;
  type: NotificationTypeEnum;
  imageUrl: string | null;
  redirectUrl: string;
  readAt: string | null;
  createdAt: string;
}

export type NotificationType = "TRANSACTION" | "KYC" | "PROPERTY";

export interface NotificationPayload {
  type: NotificationType | NotificationTypeEnum;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}
