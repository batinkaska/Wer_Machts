import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../icons";

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
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex shrink-0 justify-end p-4">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label={t("adForm.close")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
            <img
              src={photoUrls[activeIndex]}
              alt={alt}
              className="max-h-full max-w-full object-contain"
            />
            {photoUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label={t("adDetail.previousPhoto")}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label={t("adDetail.nextPhoto")}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {photoUrls.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto p-4">
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
        </div>
      )}
    </div>
  );
}
