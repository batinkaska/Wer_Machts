import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PinIcon, SearchIcon } from "../icons";
import { type PlzSuggestion, searchPostalCodes } from "../../lib/postalCodes";

const RADIUS_OPTIONS = ["10", "20", "30", "40", "50"];
export const WHOLE_PLACE_RADIUS = "ort";

interface SearchBarProps {
  query: string;
  plz: string;
  radiusKm: string;
  onQueryChange: (v: string) => void;
  onPlzChange: (v: string) => void;
  onRadiusChange: (v: string) => void;
  onSubmit: () => void;
  plzError?: string | null;
}

export function SearchBar({
  query,
  plz,
  radiusKm,
  onQueryChange,
  onPlzChange,
  onRadiusChange,
  onSubmit,
  plzError,
}: SearchBarProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<PlzSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [wholeCountrySelected, setWholeCountrySelected] = useState(false);
  const plzContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (plzContainerRef.current && !plzContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!plz) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    searchPostalCodes(plz).then((results) => {
      if (!cancelled) setSuggestions(results);
    });
    return () => {
      cancelled = true;
    };
  }, [plz]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    onSubmit();
  }

  function handleSelectPlz(plzCode: string) {
    onPlzChange(plzCode);
    setWholeCountrySelected(false);
    setShowSuggestions(false);
  }

  function handleSelectGermany() {
    onPlzChange("");
    setWholeCountrySelected(true);
    setShowSuggestions(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full sm:w-fit">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:w-fit sm:rounded-full">
        <div className="grid grid-cols-2 gap-1.5 p-1.5 sm:flex sm:items-stretch sm:gap-0 sm:divide-x sm:divide-gray-200 sm:p-0 sm:dark:divide-gray-700">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40 sm:rounded-none sm:bg-transparent sm:py-0 sm:pl-4 sm:pr-3 sm:dark:bg-transparent">
            <SearchIcon className="h-4 w-4 shrink-0 text-[#5fac5e]" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("search.queryPlaceholder")}
              className="w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 sm:w-36 sm:py-2"
            />
          </div>
          <div
            ref={plzContainerRef}
            className="relative flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40 sm:rounded-none sm:bg-transparent sm:py-0 sm:px-3 sm:dark:bg-transparent"
          >
            <PinIcon className="h-4 w-4 shrink-0 text-[#5fac5e]" />
            <input
              value={plz || (wholeCountrySelected ? t("search.wholeCountry") : "")}
              onChange={(e) => {
                setWholeCountrySelected(false);
                onPlzChange(e.target.value);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t("search.plzPlaceholder")}
              className="w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 sm:w-28 sm:py-2"
            />
            {showSuggestions && (
              <div className="absolute left-0 top-full z-20 mt-2 max-h-72 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={handleSelectGermany}
                  className="block w-full px-3 py-1.5 text-left font-medium text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  {t("search.wholeCountry")}
                </button>
                {suggestions.map((s) => (
                  <button
                    key={s.plz}
                    type="button"
                    onClick={() => handleSelectPlz(s.plz)}
                    className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {s.plz} {s.placeName}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40 sm:rounded-none sm:bg-transparent sm:py-0 sm:px-3 sm:dark:bg-transparent">
            <select
              value={radiusKm}
              onChange={(e) => onRadiusChange(e.target.value)}
              disabled={!plz}
              className="w-full min-w-0 bg-transparent text-sm text-gray-600 focus:outline-none disabled:text-gray-300 dark:text-gray-300 dark:disabled:text-gray-600 sm:w-auto sm:py-2"
            >
              <option value={WHOLE_PLACE_RADIUS}>{t("search.wholePlace")}</option>
              {RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  +{km} km
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg bg-[#5fac5e] px-3 py-2 text-sm font-medium text-white hover:bg-[#4d9a4c] sm:rounded-none sm:rounded-r-full sm:px-6 sm:py-0"
          >
            {t("search.submit")}
          </button>
        </div>
      </div>
      {plzError && <p className="mt-1 px-4 text-xs text-red-600">{plzError}</p>}
    </form>
  );
}
