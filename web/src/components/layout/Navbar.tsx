import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import wordmark from "../../assets/wordmark.png";
import { CategoryMegaMenu } from "../categories/CategoryMegaMenu";
import { SearchIcon } from "../icons";
import { useAuth } from "../../contexts/AuthContext";
import { getCoordinates, isValidPlzFormat } from "../../lib/postalCodes";
import { SearchBar } from "../search/SearchBar";
import { AccountMenu } from "./AccountMenu";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const { t } = useTranslation();
  const { firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [plz, setPlz] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [plzError, setPlzError] = useState<string | null>(null);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function handleSearch() {
    if (plz) {
      if (!isValidPlzFormat(plz)) {
        setPlzError(t("common.plzInvalid"));
        return;
      }
      const coords = await getCoordinates(plz);
      if (!coords) {
        setPlzError(t("common.plzNotFound"));
        return;
      }
    }
    setPlzError(null);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (plz) {
      params.set("plz", plz);
      params.set("radius", radiusKm);
    }
    navigate(`/ads?${params.toString()}`);
    setMobileSearchOpen(false);
  }

  const searchBar = (
    <SearchBar
      query={query}
      plz={plz}
      radiusKm={radiusKm}
      onQueryChange={setQuery}
      onPlzChange={(v) => {
        setPlz(v);
        setPlzError(null);
      }}
      onRadiusChange={setRadiusKm}
      onSubmit={handleSearch}
      plzError={plzError}
    />
  );

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <nav className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" className="h-10 w-10 rounded-md" />
            <img src={wordmark} alt="Wer Macht" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="text-[#5fac5e] hover:text-[#4d9a4c] md:hidden"
              aria-label={t("nav.searchAriaLabel")}
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            {firebaseUser ? (
              <>
                <span className="hidden text-gray-600 dark:text-gray-400 sm:inline">
                  {t("nav.loggedInAs", { email: firebaseUser.email })}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="hidden bg-[#0b5b7a] py-3 md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-4 px-4">
          <CategoryMegaMenu />
          {searchBar}
          {firebaseUser && (
            <>
              <AccountMenu />
              <NotificationBell />
            </>
          )}
        </div>
      </div>
      {mobileSearchOpen && (
        <div className="bg-[#0b5b7a] py-3 md:hidden">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4">
            <CategoryMegaMenu />
            {searchBar}
            {firebaseUser && (
              <>
                <AccountMenu />
                <NotificationBell />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
