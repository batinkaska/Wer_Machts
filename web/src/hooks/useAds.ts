import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { adsCol } from "../firebase/converters";
import { SONSTIGES_SLUG } from "../lib/categories";
import { haversineDistanceKm } from "../lib/postalCodes";
import type { Ad, AdKind } from "../types/ad";

export type AdSortOption = "newest" | "price_asc" | "price_desc";

export interface AdFilters {
  categories?: string[];
  categoryNote?: string;
  ownerId?: string;
  query?: string;
  center?: { lat: number; lng: number };
  radiusKm?: number;
  includeDrafts?: boolean;
  hideReserved?: boolean;
  adKind?: AdKind;
  minPrice?: number;
  maxPrice?: number;
  shippingOnly?: boolean;
  sortBy?: AdSortOption;
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
    hideReserved,
    adKind,
    minPrice,
    maxPrice,
    shippingOnly,
    sortBy,
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

    if (hideReserved) {
      results = results.filter((ad) => ad.status !== "in_progress");
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

    if (adKind) {
      results = results.filter((ad) => ad.adKind === adKind);
    }

    if (shippingOnly) {
      results = results.filter((ad) => ad.shipping === true);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      results = results.filter(
        (ad) =>
          ad.budget !== undefined &&
          (minPrice === undefined || ad.budget >= minPrice) &&
          (maxPrice === undefined || ad.budget <= maxPrice),
      );
    }

    if (sortBy === "price_asc" || sortBy === "price_desc") {
      const withPrice = results.filter((ad) => ad.budget !== undefined);
      const withoutPrice = results.filter((ad) => ad.budget === undefined);
      withPrice.sort((a, b) =>
        sortBy === "price_asc" ? a.budget! - b.budget! : b.budget! - a.budget!,
      );
      results = [...withPrice, ...withoutPrice];
    }

    return results;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rawAds,
    categoriesKey,
    categoryNote,
    searchQuery,
    center?.lat,
    center?.lng,
    radiusKm,
    includeDrafts,
    hideReserved,
    adKind,
    minPrice,
    maxPrice,
    shippingOnly,
    sortBy,
  ]);

  return { ads, loading, error };
}
