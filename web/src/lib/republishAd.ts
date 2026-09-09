import { doc, getDocs, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { adsCol, bidsCol } from "../firebase/converters";
import { db } from "../firebase/config";

export async function republishAd(adId: string) {
  const snap = await getDocs(query(bidsCol, where("adId", "==", adId)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  batch.update(doc(adsCol, adId), { status: "open", bidCount: 0, updatedAt: serverTimestamp() });
  await batch.commit();
}
