import type { Timestamp } from "firebase/firestore";
import type { AdKind } from "./ad";

export type BidStatus = "pending" | "accepted" | "rejected";
export type PaymentMethod = "card" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface Bid {
  id: string;
  adId: string;
  adTitle?: string;
  /** Denormalized from the ad at bid creation, purely for UI role display (payer vs recipient) —
   * server-side payment logic always re-derives this from the real ad document, never trusts it. */
  adKind?: AdKind;
  providerId: string;
  providerName: string;
  amount: number;
  message?: string;
  status: BidStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  stripePaymentIntentId?: string;
  supportAmount?: number;
  hiddenFromProfile?: boolean;
  /** UIDs that chose to hide this settled deal from their own "Meine Angebote" list —
   * per-viewer, unlike hiddenFromProfile which affects the shared public profile view. */
  hiddenForUserIds?: string[];
  createdAt: Timestamp;
}

export interface BidBankDetails {
  iban: string;
  accountHolderName: string;
  updatedAt: Timestamp;
}
