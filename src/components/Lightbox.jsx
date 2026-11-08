import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
export default function Lightbox({ images, index, onClose, onIndex }) {
  const n = images.length,
    go = (d) => onIndex((index + d + n) % n);
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  });
  const b = "absolute p-3 text-white hover:text-cyan";
  const im = images[index];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4"
      onClick={onClose}
    >
      <button
        autoFocus
        aria-label="Close gallery"
        onClick={onClose}
        className={`${b} right-3 top-3`}
      >
        <X />
      </button>
      <button
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        className={`${b} left-2`}
      >
        <ChevronLeft size={36} />
      </button>
      <figure
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-5xl"
      >
        <img
          src={im.src}
          alt={im.alt}
          className="max-h-[80vh] w-full object-contain"
        />
        <figcaption className="mt-3 text-center text-sm text-white/70">
          {im.alt} · {index + 1}/{n}
        </figcaption>
      </figure>
      <button
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        className={`${b} right-2`}
      >
        <ChevronRight size={36} />
      </button>
    </div>
  );
}
