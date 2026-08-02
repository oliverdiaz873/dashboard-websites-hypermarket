import type { NotificationType } from '../enums/notification-type';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  createdAt: number;
}
