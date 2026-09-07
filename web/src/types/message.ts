import type { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  conversationId: string;
  adId: string;
  senderId: string;
  recipientId: string;
  participantIds: string[];
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export function makeConversationId(adId: string, uidA: string, uidB: string): string {
  const [first, second] = [uidA, uidB].sort();
  return `${adId}_${first}_${second}`;
}
