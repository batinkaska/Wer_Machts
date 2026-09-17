import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";

interface BidDoc {
  adId: string;
  adTitle?: string;
  providerId: string;
  providerName: string;
  status: string;
}

interface AdDoc {
  ownerId: string;
  ownerName: string;
  title: string;
}

interface MessageDoc {
  conversationId: string;
  adId?: string;
  adTitle?: string;
  senderId: string;
  recipientId: string;
  participantIds: string[];
}

// A bid's own document already fully captures "who bid on what" and "who owns
// the ad" (via a lookup) — deriving bid_placed/bid_accepted/bid_rejected here
// server-side means the client can never forge a notification (fake
// recipient, fake actor name, fake ad) the way a direct Firestore write to
// `notifications` could. This replaces what used to be several separate
// client-side createNotification() calls scattered across AdDetailPage,
// MyBidsPage and PaymentPage.
export const onBidWritten = onDocumentWritten("bids/{bidId}", async (event) => {
  const before = event.data?.before?.data() as BidDoc | undefined;
  const after = event.data?.after?.data() as BidDoc | undefined;
  if (!after) return; // deleted — nothing to notify about

  const db = getFirestore();
  const adSnap = await db.collection("ads").doc(after.adId).get();
  const ad = adSnap.data() as AdDoc | undefined;
  if (!ad) return;

  // Never notify someone about their own bid on their own ad.
  if (ad.ownerId === after.providerId) return;

  if (!before) {
    // New bid.
    await db.collection("notifications").add({
      recipientId: ad.ownerId,
      type: "bid_placed",
      actorId: after.providerId,
      actorName: after.providerName,
      adId: after.adId,
      adTitle: after.adTitle ?? ad.title,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  if (before.status === after.status) return;

  if (after.status === "accepted") {
    await db.collection("notifications").add({
      recipientId: after.providerId,
      type: "bid_accepted",
      actorId: ad.ownerId,
      actorName: ad.ownerName,
      adId: after.adId,
      adTitle: after.adTitle ?? ad.title,
      bidId: event.params.bidId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } else if (after.status === "rejected") {
    await db.collection("notifications").add({
      recipientId: after.providerId,
      type: "bid_rejected",
      actorId: ad.ownerId,
      actorName: ad.ownerName,
      adId: after.adId,
      adTitle: after.adTitle ?? ad.title,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
});

// Same reasoning as onBidWritten: deriving the notification from the already
// rules-validated `messages` document (real sender, real participants) means
// a client can no longer create a "message" notification for an arbitrary
// recipient with a made-up sender name.
export const onMessageCreated = onDocumentCreated("messages/{messageId}", async (event) => {
  const message = event.data?.data() as MessageDoc | undefined;
  if (!message) return;

  const db = getFirestore();
  const senderSnap = await db.collection("users").doc(message.senderId).get();
  const senderName = (senderSnap.data()?.displayName as string | undefined) ?? "";

  await db.collection("notifications").add({
    recipientId: message.recipientId,
    type: "message",
    actorId: message.senderId,
    actorName: senderName,
    ...(message.adId ? { adId: message.adId } : {}),
    ...(message.adTitle ? { adTitle: message.adTitle } : {}),
    conversationId: message.conversationId,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
});
