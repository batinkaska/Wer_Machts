import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { adsCol } from "../firebase/converters";
import { SONSTIGES_SLUG } from "../lib/categories";
import { haversineDistanceKm } from "../lib/postalCodes";
import type { Ad } from "../types/ad";

export interface AdFilters {
  categories?: string[];
  categoryNote?: string;
  ownerId?: string;
  query?: string;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  includeDrafts?: boolean;
}

export function useAds(filters: AdFilters = {}) {
  const {
    categories,
    categoryNote,
    ownerId,
    query: searchQuery,
    center,
    radiusKm,
    includeDrafts,
  } = filters;
  const [rawAds, setRawAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const constraints = [];
    if (ownerId) constraints.push(where("ownerId", "==", ownerId));
    constraints.push(orderBy("createdAt", "desc"));

    return onSnapshot(
      query(adsCol, ...constraints),
      (snap) => {
        setRawAds(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      },
    );
  }, [ownerId]);

  const categoriesKey = categories?.join(",") ?? "";

  const ads = useMemo(() => {
    let results = rawAds;

    if (!includeDrafts) {
      results = results.filter((ad) => ad.status !== "draft" && ad.status !== "closed");
    }

    if (categories && categories.length > 0) {
      results = results.filter((ad) => ad.categories.some((c) => categories.includes(c)));

      if (categories.includes(SONSTIGES_SLUG) && categoryNote) {
        const needle = categoryNote.toLowerCase();
        results = results.filter(
          (ad) =>
            !ad.categories.includes(SONSTIGES_SLUG) ||
            (ad.categoryNote ?? "").toLowerCase().includes(needle),
        );
      }
    }

    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      results = results.filter((ad) =>
        `${ad.title} ${ad.description}`.toLowerCase().includes(needle),
      );
    }

    if (center && radiusKm !== undefined) {
      results = results.filter(
        (ad) =>
          ad.lat &&
          ad.lng &&
          haversineDistanceKm(center, { lat: ad.lat, lng: ad.lng }) <= radiusKm,
      );
    }

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawAds, categoriesKey, categoryNote, searchQuery, center?.lat, center?.lng, radiusKm, includeDrafts]);

  return { ads, loading, error };
}
