import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  collection,
  doc,
} from "firebase/firestore";
import type { Ad } from "../types/ad";
import type { Bid, BidBankDetails } from "../types/bid";
import type { ChatMessage } from "../types/message";
import type { Notification } from "../types/notification";
import type { Report } from "../types/report";
import type { Review } from "../types/review";
import type { AppUser, PublicProfile } from "../types/user";
import { db } from "./config";

function makeConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(value: T) {
      const { id: _id, ...rest } = value;
      return rest;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
      return { id: snapshot.id, ...snapshot.data() } as T;
    },
  };
}

export const userConverter: FirestoreDataConverter<AppUser> = {
  toFirestore(value: AppUser) {
    const { uid: _uid, ...rest } = value;
    return rest;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    return { uid: snapshot.id, ...snapshot.data() } as AppUser;
  },
};
export const adConverter: FirestoreDataConverter<Ad> = {
  toFirestore(value: Ad) {
    const { id: _id, ...rest } = value;
    return rest;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data() as Ad & { category?: string };
    const categories = data.categories ?? (data.category ? [data.category] : []);
    const photoUrls = data.photoUrls ?? [];
    return { ...data, id: snapshot.id, categories, photoUrls };
  },
};
export const bidConverter = makeConverter<Bid>();
export const messageConverter = makeConverter<ChatMessage>();
export const reportConverter = makeConverter<Report>();
export const notificationConverter = makeConverter<Notification>();
export const reviewConverter = makeConverter<Review>();

const publicProfileConverter: FirestoreDataConverter<PublicProfile> = {
  toFirestore(value: PublicProfile) {
    const { uid: _uid, ...rest } = value;
    return rest;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    return { uid: snapshot.id, ...snapshot.data() } as PublicProfile;
  },
};

/** Only readable by the owner — use publicProfilesCol to look at anyone else. */
export const usersCol = collection(db, "users").withConverter<AppUser>(userConverter);
/** Public, read-only mirror of users/{uid}, written by the onUserWritten Cloud Function. */
export const publicProfilesCol = collection(db, "publicProfiles").withConverter<PublicProfile>(
  publicProfileConverter,
);
export const adsCol = collection(db, "ads").withConverter(adConverter);
export const bidsCol = collection(db, "bids").withConverter(bidConverter);
export const messagesCol = collection(db, "messages").withConverter(messageConverter);
export const reportsCol = collection(db, "reports").withConverter(reportConverter);
export const notificationsCol = collection(db, "notifications").withConverter(notificationConverter);
export const reviewsCol = collection(db, "reviews").withConverter(reviewConverter);

const bidBankDetailsConverter: FirestoreDataConverter<BidBankDetails> = {
  toFirestore(value: BidBankDetails) {
    return { ...value };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    return snapshot.data() as BidBankDetails;
  },
};

/** Private per-bid subdocument: only the payment recipient may read/write it (see firestore.rules). */
export function bidBankDetailsDoc(bidId: string) {
  return doc(db, "bids", bidId, "private", "bankDetails").withConverter(bidBankDetailsConverter);
}
