import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserIcon } from "../icons";

export function AccountMenu() {
  const { t } = useTranslation();
  const { firebaseUser } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    { to: `/profile/${firebaseUser?.uid}`, label: t("nav.menuProfile") },
    { to: "/finanzen", label: t("nav.menuFinances") },
    { to: "/my-ads", label: t("nav.menuMyAds") },
    { to: "/my-bids", label: t("nav.menuMyBids") },
    { to: "/messages", label: t("nav.menuMessages") },
    { to: "/settings", label: t("nav.menuSettings") },
    { to: "/favorites", label: t("nav.menuFavorites") },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col items-center gap-0.5 text-white hover:text-white/80"
      >
        <UserIcon className="h-5 w-5 text-[#5fac5e]" />
        <span className="text-xs font-medium">{t("nav.menuMine")}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded border border-gray-200 bg-white py-1 text-left shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
