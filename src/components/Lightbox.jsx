import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images = [], index = 0, onClose, onIndex }) {
  const total = images.length;

  const go = (direction) => {
    if (total <= 1) return;

    onIndex((index + direction + total) % total);
  };

  useEffect(() => {
    if (!total) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, total, onClose, onIndex]);

  if (!total) return null;

  const currentIndex = Math.min(Math.max(index, 0), total - 1);
  const image = images[currentIndex];

  if (!image?.src) return null;

  const buttonClass =
    "absolute z-10 rounded-full p-3 text-white transition-colors hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        autoFocus
        aria-label="Close gallery"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className={`${buttonClass} right-3 top-3`}
      >
        <X size={28} />
      </button>

      {/* Previous */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
          className={`${buttonClass} left-2`}
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image */}
      <figure
        onClick={(event) => event.stopPropagation()}
        className="max-h-full max-w-5xl"
      >
        <img
          src={image.src}
          alt={image.alt || "Project image"}
          draggable="false"
          className="max-h-[80vh] w-full object-contain"
        />

        <figcaption className="mt-3 text-center text-sm text-white/70">
          {image.alt || "Project image"} · {currentIndex + 1}/{total}
        </figcaption>
      </figure>

      {/* Next */}
      {total > 1 && (
        <button
          type="button"
          aria-label="Next image"
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
          className={`${buttonClass} right-2`}
        >
          <ChevronRight size={36} />
        </button>
      )}
    </div>
  );
}
