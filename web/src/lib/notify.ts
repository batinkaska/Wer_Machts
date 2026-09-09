import { addDoc, serverTimestamp } from "firebase/firestore";
import { notificationsCol } from "../firebase/converters";
import type { NotificationType } from "../types/notification";

export async function createNotification(data: {
  recipientId: string;
  type: NotificationType;
  actorId: string;
  actorName: string;
  adId?: string;
  adTitle?: string;
  conversationId?: string;
  bidId?: string;
}) {
  try {
    await addDoc(notificationsCol, {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    } as never);
  } catch {
    // Notifications are best-effort — a failed write (e.g. rules not deployed
    // yet, or a transient error) must never break the primary action.
  }
}
