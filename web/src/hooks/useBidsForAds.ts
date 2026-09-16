import { onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { bidsCol } from "../firebase/converters";
import type { Bid } from "../types/bid";

const MAX_IN_CLAUSE = 30;

export function useBidsForAds(adIds: string[]) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const key = adIds.join(",");

  useEffect(() => {
    if (adIds.length === 0) {
      setBids([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(bidsCol, where("adId", "in", adIds.slice(0, MAX_IN_CLAUSE)));
    return onSnapshot(q, (snap) => {
      setBids(snap.docs.map((d) => d.data()));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { bids, loading };
}
