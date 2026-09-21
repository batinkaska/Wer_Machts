import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CATEGORY_GROUPS, CATEGORY_GROUP_ICONS, categoryGroupName, categoryLabel } from "../../lib/categories";
import { ChevronDownIcon, ChevronRightIcon } from "../icons";

const MENU_WIDTH = 288;
const VIEWPORT_MARGIN = 16;

export function CategoryMegaMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) {
        setOpen(false);
        setExpandedGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnScroll() {
      setOpen(false);
      setExpandedGroup(null);
    }
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setExpandedGroup(null);
  }

  function toggleOpen() {
    if (!open) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN;
        setMenuPos({ top: rect.bottom + 8, left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)) });
      }
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        {t("categoryPicker.allCategories")}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            className="fixed z-30 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
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
            const isExpanded = expandedGroup === group.groupKey;

            return (
              <div key={group.groupKey}>
                <div className="flex items-center gap-1 pr-2">
                  <Link
                    to={groupHref}
                    onClick={closeMenu}
                    className="flex flex-1 items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-[#5fac5e]" />}
                    {categoryGroupName(t, group.groupKey)}
                  </Link>
                  {hasSubmenu && (
                    <button
                      type="button"
                      onClick={() => setExpandedGroup(isExpanded ? null : group.groupKey)}
                      aria-label={categoryGroupName(t, group.groupKey)}
                      className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700"
                    >
                      <ChevronRightIcon
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {hasSubmenu && isExpanded && (
                  <div className="space-y-0.5 bg-gray-50 py-1.5 pl-11 pr-4 dark:bg-gray-900/40">
                    {group.categories.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/ads?categories=${c.slug}`}
                        onClick={closeMenu}
                        className="block py-1.5 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {categoryLabel(t, c.slug)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          </div>,
          document.body,
        )}
    </div>
  );
}
