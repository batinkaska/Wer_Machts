import type { Timestamp } from "firebase/firestore";

export type AdStatus = "draft" | "open" | "in_progress" | "closed";
export type AdKind = "biete" | "suche";
export type PriceType = "fixed" | "negotiable" | "on_request" | "gift";

export interface Ad {
  id: string;
  adKind: AdKind;
  title: string;
  description: string;
  categories: string[];
  categoryNote?: string;
  city: string;
  postalCode: string;
  street?: string;
  showFullAddress?: boolean;
  lat: number;
  lng: number;
  budget?: number;
  priceType: PriceType;
  photoUrls: string[];
  ownerId: string;
  ownerName: string;
  status: AdStatus;
  bidCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NewAd = Omit<
  Ad,
  "id" | "ownerId" | "ownerName" | "status" | "bidCount" | "createdAt" | "updatedAt"
>;
