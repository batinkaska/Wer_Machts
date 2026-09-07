import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { adsCol } from "../firebase/converters";
import type { Ad } from "../types/ad";

export function useFavoriteAds(adIds: string[] | undefined) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const idsKey = (adIds ?? []).join(",");

  useEffect(() => {
    if (!adIds || adIds.length === 0) {
      setAds([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(adIds.map((id) => getDoc(doc(adsCol, id))))
      .then((snaps) => {
        if (cancelled) return;
        setAds(snaps.filter((s) => s.exists()).map((s) => s.data()));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return { ads, loading };
}
