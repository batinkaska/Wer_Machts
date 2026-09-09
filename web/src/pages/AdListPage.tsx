import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AdKindFilter } from "../components/ads/AdKindFilter";
import { AdList } from "../components/ads/AdList";
import { CategoryFilter } from "../components/ads/CategoryFilter";
import { PriceRangeFilter } from "../components/ads/PriceRangeFilter";
import { ShippingFilter } from "../components/ads/ShippingFilter";
import { SortDropdown, type SortOption } from "../components/ads/SortDropdown";
import { SearchBar, WHOLE_PLACE_RADIUS } from "../components/search/SearchBar";
import { useAds } from "../hooks/useAds";
import { getCoordinates, isValidPlzFormat } from "../lib/postalCodes";
import type { AdKind } from "../types/ad";

export function AdListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriesParam = searchParams.get("categories") ?? "";
  const categories = categoriesParam ? categoriesParam.split(",") : [];
  const categoryNote = searchParams.get("catNote") ?? "";
  const q = searchParams.get("q") ?? "";
  const plz = searchParams.get("plz") ?? "";
  const radius = searchParams.get("radius") ?? "10";
  const adKind = (searchParams.get("adKind") ?? "") as AdKind | "";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const shippingOnly = searchParams.get("shipping") === "1";
  const sort = (searchParams.get("sort") ?? "newest") as SortOption;

  const [center, setCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [plzError, setPlzError] = useState<string | null>(null);

  useEffect(() => {
    if (!plz) {
      setCenter(undefined);
      setPlzError(null);
      return;
    }
    if (!isValidPlzFormat(plz)) {
      setPlzError(t("common.plzInvalid"));
      setCenter(undefined);
      return;
    }
    let cancelled = false;
    getCoordinates(plz).then((coords) => {
      if (cancelled) return;
      if (!coords) {
        setPlzError(t("common.plzNotFound"));
        setCenter(undefined);
      } else {
        setPlzError(null);
        setCenter(coords);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [plz]);

  const { ads, loading } = useAds({
    categories: categories.length > 0 ? categories : undefined,
    categoryNote: categoryNote || undefined,
    query: q || undefined,
    hideReserved: true,
    center,
    radiusKm: center && radius !== WHOLE_PLACE_RADIUS ? Number(radius) : undefined,
    adKind: adKind || undefined,
    minPrice,
    maxPrice,
    shippingOnly,
    sortBy: sort,
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("adList.pageTitle")}</h1>
      <div className="mb-4 flex flex-wrap items-start justify-center gap-3">
        <CategoryFilter
          selected={categories}
          onSelectedChange={(next) => updateParam("categories", next.join(","))}
          note={categoryNote}
          onNoteChange={(v) => updateParam("catNote", v)}
        />
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onApply={(min, max) => {
            const next = new URLSearchParams(searchParams);
            if (min !== undefined) next.set("minPrice", String(min));
            else next.delete("minPrice");
            if (max !== undefined) next.set("maxPrice", String(max));
            else next.delete("maxPrice");
            setSearchParams(next);
          }}
        />
        <AdKindFilter value={adKind} onChange={(v) => updateParam("adKind", v)} />
        <ShippingFilter checked={shippingOnly} onChange={(v) => updateParam("shipping", v ? "1" : "")} />
        <SortDropdown value={sort} onChange={(v) => updateParam("sort", v)} />
      </div>
      <div className="mb-6 flex justify-center">
        <SearchBar
          query={q}
          plz={plz}
          radiusKm={radius}
          onQueryChange={(v) => updateParam("q", v)}
          onPlzChange={(v) => updateParam("plz", v)}
          onRadiusChange={(v) => updateParam("radius", v)}
          onSubmit={() => {}}
          plzError={plzError}
        />
      </div>
      <AdList ads={ads} loading={loading} />
    </div>
  );
}
