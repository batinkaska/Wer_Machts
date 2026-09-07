import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CATEGORY_GROUPS, CATEGORY_GROUP_ICONS, categoryGroupName, categoryLabel } from "../../lib/categories";
import { ChevronDownIcon, ChevronRightIcon } from "../icons";

export function CategoryMegaMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenu() {
    setOpen(false);
    setHoveredGroup(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        {t("categoryPicker.allCategories")}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <Link
            to="/ads"
            onClick={closeMenu}
            className="block border-b border-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {t("categoryPicker.allCategories")}
          </Link>
          {CATEGORY_GROUPS.map((group) => {
            const Icon = CATEGORY_GROUP_ICONS[group.groupKey];
            const hasSubmenu = group.categories.length > 1;
            const groupHref = `/ads?categories=${group.categories.map((c) => c.slug).join(",")}`;

            return (
              <div
                key={group.groupKey}
                className="relative"
                onMouseEnter={() => hasSubmenu && setHoveredGroup(group.groupKey)}
                onMouseLeave={() => setHoveredGroup((prev) => (prev === group.groupKey ? null : prev))}
              >
                <Link
                  to={groupHref}
                  onClick={closeMenu}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-[#5fac5e]" />}
                    {categoryGroupName(t, group.groupKey)}
                  </span>
                  {hasSubmenu && (
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  )}
                </Link>

                {hasSubmenu && hoveredGroup === group.groupKey && (
                  <div className="absolute left-full top-0 z-30 ml-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {group.categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/ads?categories=${c.slug}`}
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {categoryLabel(t, c.slug)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
