import type { Timestamp } from "firebase/firestore";

export interface Review {
  id: string;
  conversationId: string;
  adId?: string;
  revieweeId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}
