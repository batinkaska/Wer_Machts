import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { adsCol } from "../firebase/converters";
import type { Ad } from "../types/ad";

export function useAd(adId: string | undefined) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adId) {
      setAd(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(doc(adsCol, adId), (snap) => {
      setAd(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
  }, [adId]);

  return { ad, loading };
}
