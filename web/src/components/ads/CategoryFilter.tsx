import { useTranslation } from "react-i18next";
import { CategoryMultiPicker } from "../categories/CategoryMultiPicker";

interface CategoryFilterProps {
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  note: string;
  onNoteChange: (value: string) => void;
}

export function CategoryFilter({
  selected,
  onSelectedChange,
  note,
  onNoteChange,
}: CategoryFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded border border-gray-300 px-3 py-2 dark:border-gray-600">
      <CategoryMultiPicker
        selected={selected}
        onChange={onSelectedChange}
        note={note}
        onNoteChange={onNoteChange}
        placeholder={t("categoryPicker.allCategories")}
        noteLabel={t("categoryPicker.filterNoteLabel")}
        notePlaceholder={t("categoryPicker.filterNotePlaceholder")}
        showAllOption
        allowGroupSelect
      />
    </div>
  );
}
