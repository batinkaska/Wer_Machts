import type { Timestamp } from "firebase/firestore";

export type NotificationType =
  | "message"
  | "bid_placed"
  | "bid_accepted"
  | "bid_rejected"
  | "new_follower"
  | "verify_phone"
  | "payment_confirmed";

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  read: boolean;
  createdAt: Timestamp;
  adId?: string;
  adTitle?: string;
  conversationId?: string;
  bidId?: string;
}
