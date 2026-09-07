import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StarIcon } from "../icons";

export function StarRatingDisplay({ average, count }: { average: number; count: number }) {
  const { t } = useTranslation();
  const rounded = Math.round(average);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${i <= rounded ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {average.toFixed(1)} · {t("reviews.average", { count })}
      </span>
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          className="p-0.5"
          aria-label={String(i)}
        >
          <StarIcon
            className={`h-7 w-7 ${i <= (hover || value) ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}`}
          />
        </button>
      ))}
    </div>
  );
}
