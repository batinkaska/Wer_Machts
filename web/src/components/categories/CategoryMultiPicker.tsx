import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CATEGORY_GROUPS,
  type CategoryGroup,
  SONSTIGES_SLUG,
  categoryGroupName,
  categoryLabel,
  categoryLabels,
} from "../../lib/categories";

interface CategoryMultiPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  note?: string;
  onNoteChange?: (value: string) => void;
  placeholder?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  showAllOption?: boolean;
  allowGroupSelect?: boolean;
}

export function CategoryMultiPicker({
  selected,
  onChange,
  note,
  onNoteChange,
  placeholder,
  noteLabel,
  notePlaceholder,
  showAllOption,
  allowGroupSelect,
}: CategoryMultiPickerProps) {
  const { t } = useTranslation();
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

  function toggle(slug: string) {
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  }

  function toggleGroup(group: CategoryGroup) {
    const slugs = group.categories.map((c) => c.slug);
    const allSelected = slugs.every((s) => selected.includes(s));
    onChange(
      allSelected
        ? selected.filter((s) => !slugs.includes(s))
        : [...selected, ...slugs.filter((s) => !selected.includes(s))],
    );
  }

  const summary =
    selected.length === 0
      ? (placeholder ?? t("categoryPicker.choosePlaceholder"))
      : selected.length === 1
        ? categoryLabels(t, selected)
        : t("categoryPicker.nSelected", { count: selected.length });

  return (
    <div>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-medium text-[#5fac5e] hover:underline"
        >
          {summary}
        </button>
        {open && (
          <div className="absolute left-0 top-full z-20 mt-2 max-h-80 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {showAllOption && (
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                className={`mb-3 w-full rounded-full border px-3 py-1 text-xs ${
                  selected.length === 0
                    ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {selected.length === 0 ? "✓ " : ""}
                {t("categoryPicker.allCategories")}
              </button>
            )}
            {CATEGORY_GROUPS.map((group) => {
              const groupSelected = group.categories.every((c) => selected.includes(c.slug));
              return (
              <div key={group.groupKey} className="mb-3">
                {allowGroupSelect ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold hover:underline ${
                      groupSelected ? "text-[#4d9a4c]" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                        groupSelected
                          ? "border-[#5fac5e] bg-[#5fac5e] text-white"
                          : "border-gray-300 dark:border-gray-500"
                      }`}
                    >
                      {groupSelected && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-2.5 w-2.5"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {categoryGroupName(t, group.groupKey)}
                  </button>
                ) : (
                  <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {categoryGroupName(t, group.groupKey)}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {group.categories.map((c) => {
                    const isSelected = selected.includes(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => toggle(c.slug)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          isSelected
                            ? "border-[#5fac5e] bg-green-50 text-[#4d9a4c] dark:bg-green-950"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {categoryLabel(t, c.slug)}
                      </button>
                    );
                  })}
                </div>
              </div>
              );
            })}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 w-full rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              {t("categoryPicker.done")}
            </button>
          </div>
        )}
      </div>
      {selected.includes(SONSTIGES_SLUG) && onNoteChange && (
        <div className="mt-2">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
            {noteLabel ?? t("categoryPicker.noteLabel")}
          </label>
          <input
            value={note ?? ""}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={notePlaceholder ?? t("categoryPicker.notePlaceholder")}
            className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      )}
    </div>
  );
}
