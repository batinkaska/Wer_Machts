import { getDocs, query, where } from "firebase/firestore";
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
    let cancelled = false;
    setLoading(true);
    const q = query(bidsCol, where("adId", "in", adIds.slice(0, MAX_IN_CLAUSE)));
    getDocs(q)
      .then((snap) => {
        if (!cancelled) setBids(snap.docs.map((d) => d.data()));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { bids, loading };
}
