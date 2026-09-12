import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbox } from "../common/Lightbox";

interface PhotoGalleryProps {
  photoUrls: string[];
  alt: string;
}

export function PhotoGallery({ photoUrls, alt }: PhotoGalleryProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (photoUrls.length === 0) {
    return <div className="aspect-video w-full rounded-lg bg-gray-100 dark:bg-gray-800" />;
  }

  function showPrevious() {
    setActiveIndex((i) => (i === 0 ? photoUrls.length - 1 : i - 1));
  }

  function showNext() {
    setActiveIndex((i) => (i === photoUrls.length - 1 ? 0 : i + 1));
  }

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={photoUrls[activeIndex]}
          alt={alt}
          onClick={() => setFullscreen(true)}
          className="h-full w-full cursor-zoom-in object-cover"
        />
        {photoUrls.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={t("adDetail.previousPhoto")}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label={t("adDetail.nextPhoto")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              ›
            </button>
          </>
        )}
      </div>
      {photoUrls.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photoUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${
                i === activeIndex ? "border-[#5fac5e]" : "border-transparent"
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <Lightbox
          photoUrls={photoUrls}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setFullscreen(false)}
          alt={alt}
        />
      )}
    </div>
  );
}
