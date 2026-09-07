import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { bidsCol } from "../firebase/converters";
import type { Bid } from "../types/bid";

export function useBids(adId: string | undefined) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adId) {
      setBids([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(bidsCol, where("adId", "==", adId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setBids(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [adId]);

  return { bids, loading };
}

export function useMyBids(providerId: string | undefined) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setBids([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      bidsCol,
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) => {
      setBids(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
  }, [providerId]);

  return { bids, loading };
}
