import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { getProjects } from "../services/projectService";

export default function Gallery() {
  const [projects, setProjects] = useState([]);
  const [standaloneImages, setStandaloneImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(null);

  // Fetch project images and standalone admin gallery images
  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        setLoading(true);
        setError("");

        const [projectResult, galleryResponse] = await Promise.all([
          getProjects(),
          fetch("/api/gallery"),
        ]);

        if (!galleryResponse.ok) {
          throw new Error("Unable to load standalone gallery images.");
        }

        const galleryResult = await galleryResponse.json();

        const projectItems = Array.isArray(projectResult)
          ? projectResult
          : (projectResult?.data ?? []);

        const uploadedItems = galleryResult?.images ?? [];

        if (!cancelled) {
          setProjects(
            projectItems.filter((project) => project.published !== false),
          );

          setStandaloneImages(uploadedItems.filter((image) => image?.src));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load gallery images.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  // Existing project gallery images
  const projectImages = useMemo(
    () =>
      projects.flatMap((project) =>
        (Array.isArray(project.gallery) ? project.gallery : [])
          .filter((image) => image?.src)
          .map((image, index) => ({
            src: image.src,
            alt:
              image.alt || `${project.title || "Project"} image ${index + 1}`,
            title: project.title || "Glass n Wood",
            key: `project-${project.slug || project._id}-${index}-${image.src}`,
          })),
      ),
    [projects],
  );

  // Images uploaded through Admin Gallery
  const adminImages = useMemo(
    () =>
      standaloneImages.map((image) => ({
        src: image.src,
        alt: image.alt || "Glass n Wood gallery image",
        title: "Glass n Wood",
        key: `admin-${image._id || image.publicId || image.src}`,
      })),
    [standaloneImages],
  );

  // Combine both image sources
  const galleryImages = useMemo(
    () => [...adminImages, ...projectImages],
    [adminImages, projectImages],
  );

  const closeLightbox = useCallback(() => setActiveImage(null), []);

  const showPrevious = useCallback(() => {
    setActiveImage((current) =>
      current === null || galleryImages.length === 0
        ? null
        : (current - 1 + galleryImages.length) % galleryImages.length,
    );
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setActiveImage((current) =>
      current === null || galleryImages.length === 0
        ? null
        : (current + 1) % galleryImages.length,
    );
  }, [galleryImages.length]);

  useEffect(() => {
    if (activeImage === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, closeLightbox, showPrevious, showNext]);

  return (
    <main className="bg-paper text-charcoal">
      <section className="wrap pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pt-12">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-wood">
          Glass n Wood · Gallery
        </p>

        <div className="mt-5 grid gap-4">
          <h1 className="whitespace-nowrap font-serif text-3xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Spaces made to<span className="text-wood"> inspire.</span>
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-charcoal/65 sm:text-base">
            A collection of interiors, glasswork, furniture and details crafted
            for modern spaces.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse bg-charcoal/5"
              />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="py-16 text-center text-sm text-red-700">
            {error}
          </p>
        ) : galleryImages.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-serif text-2xl">Gallery coming soon</h2>
            <p className="mt-2 text-sm text-charcoal/60">
              Upload images through the admin gallery management page.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-8 border-b border-charcoal/10 pb-5 text-sm text-charcoal/55">
              {galleryImages.length} images
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Open image ${index + 1}: ${image.alt}`}
                  className="group block aspect-[4/5] overflow-hidden bg-charcoal/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 border-t border-charcoal/10 pt-8">
          <p className="text-sm text-charcoal/65">
            Looking for a custom glass or mirror design?
          </p>

          <Link
            to="/products/glass-mirrors"
            className="mt-4 inline-flex items-center gap-2 bg-charcoal px-5 py-3.5 text-sm text-paper transition-colors hover:bg-wood"
          >
            Explore Glass & Mirrors
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {activeImage !== null && galleryImages[activeImage] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close gallery"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white/80 transition hover:text-white"
          >
            <X size={25} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="absolute left-2 flex h-12 w-12 items-center justify-center text-white/80 transition hover:text-white sm:left-6"
              >
                <ArrowLeft size={27} strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-2 flex h-12 w-12 items-center justify-center text-white/80 transition hover:text-white sm:right-6"
              >
                <ArrowRight size={27} strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            className="flex max-h-full max-w-6xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={galleryImages[activeImage].src}
              alt={galleryImages[activeImage].alt}
              className="max-h-[82vh] max-w-full object-contain"
            />

            <p className="mt-4 text-center text-xs tracking-wide text-white/65">
              {activeImage + 1} / {galleryImages.length}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
