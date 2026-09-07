import type { Timestamp } from "firebase/firestore";

export type BidStatus = "pending" | "accepted" | "rejected";
export type PaymentMethod = "card" | "cash";

export interface Bid {
  id: string;
  adId: string;
  adTitle?: string;
  providerId: string;
  providerName: string;
  amount: number;
  message?: string;
  status: BidStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Timestamp;
}
