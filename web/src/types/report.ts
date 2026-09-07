import type { Timestamp } from "firebase/firestore";

export interface Report {
  id: string;
  adId?: string;
  reportedUserId?: string;
  reporterId: string;
  reason: string;
  createdAt: Timestamp;
}
