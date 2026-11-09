import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  CalendarDays,
  Images,
  MessageCircle,
} from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import Lightbox from "../components/Lightbox.jsx";
import { getProject, getProjects } from "../services/projectService.js";

/* ---------------------------------------
   Reusable components
--------------------------------------- */

function ProjectImageFallback({
  label = "Project image unavailable",
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-center bg-stone px-4 text-center text-sm text-charcoal/55 ${className}`}
    >
      {label}
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="wrap animate-pulse py-12 sm:py-16">
      <div className="h-4 w-28 bg-stone" />
      <div className="mt-10 h-12 max-w-xl bg-stone" />
      <div className="mt-5 h-5 max-w-md bg-stone" />
      <div className="mt-12 aspect-[16/9] w-full bg-stone" />
    </div>
  );
}

function ProjectError({ message, onRetry }) {
  return (
    <section className="wrap py-24 sm:py-32">
      <p className="eyebrow">Project portfolio</p>

      <h1 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">
        Unable to load project
      </h1>

      <p className="mt-4 max-w-lg leading-7 text-charcoal/60">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-8 bg-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      >
        Try again
      </button>

      <Link
        to="/projects"
        className="ml-4 inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-wood"
      >
        <ArrowLeft size={16} />
        All projects
      </Link>
    </section>
  );
}

function ProjectNotFound() {
  return (
    <section className="wrap py-24 sm:py-32">
      <p className="eyebrow">Project portfolio</p>

      <h1 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">
        Project not found
      </h1>

      <p className="mt-4 max-w-lg leading-7 text-charcoal/60">
        This project may have been unpublished or removed, or the link may be
        incorrect. Explore our portfolio to discover more of our work.
      </p>

      <Link
        to="/projects"
        className="mt-8 inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wood"
      >
        <ArrowLeft size={17} />
        Back to projects
      </Link>
    </section>
  );
}

/* ---------------------------------------
   Main project detail page
--------------------------------------- */

export default function ProjectDetail() {
  const { slug } = useParams();

  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [coverError, setCoverError] = useState(false);

  /* ---------------------------------------
     Fetch project and related projects
  --------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setStatus("loading");
      setError("");
      setProject(null);
      setRelatedProjects([]);
      setActiveImage(null);
      setCoverError(false);

      try {
        const projectData = await getProject(slug);

        if (cancelled) return;

        if (!projectData) {
          setStatus("ready");
          return;
        }

        setProject(projectData);
        setStatus("ready");

        // Related projects are optional.
        // Their failure must not break the main project page.
        try {
          const projects = await getProjects();

          if (cancelled) return;

          const related = (Array.isArray(projects) ? projects : [])
            .filter(
              (item) => item && item.slug && item.slug !== projectData.slug,
            )
            .sort(
              (a, b) =>
                Number(b.category === projectData.category) -
                Number(a.category === projectData.category),
            )
            .slice(0, 3);

          setRelatedProjects(related);
        } catch {
          if (!cancelled) {
            setRelatedProjects([]);
          }
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.message || "Unable to load this project. Please try again.",
        );
        setStatus("error");
      }
    }

    if (slug) {
      loadProject();
    } else {
      setStatus("ready");
    }

    return () => {
      cancelled = true;
    };
  }, [slug, retryKey]);

  /* ---------------------------------------
     Normalize gallery data
  --------------------------------------- */

  const gallery = useMemo(() => {
    if (!Array.isArray(project?.gallery)) {
      return [];
    }

    return project.gallery.filter(
      (image) =>
        image && typeof image.src === "string" && image.src.trim().length > 0,
    );
  }, [project?.gallery]);

  const featuredImage = project?.cover || gallery[0]?.src || "";

  /* ---------------------------------------
     SEO
  --------------------------------------- */

  useSeo(
    project?.title || "Project",
    project?.description ||
      "Explore the interior design and craftsmanship projects by Glass n Wood.",
    featuredImage,
  );

  /* ---------------------------------------
     Actions
  --------------------------------------- */

  const retryLoading = () => {
    setRetryKey((current) => current + 1);
  };

  const openGallery = (index) => {
    if (gallery.length > 0) {
      setActiveImage(index);
    }
  };

  const closeGallery = () => {
    setActiveImage(null);
  };

  /* ---------------------------------------
     Loading and error states
  --------------------------------------- */

  if (status === "loading") {
    return <ProjectDetailSkeleton />;
  }

  if (status === "error") {
    return <ProjectError message={error} onRetry={retryLoading} />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  /* ---------------------------------------
     Page UI
  --------------------------------------- */

  return (
    <article className="overflow-hidden bg-paper text-charcoal">
      {/* Breadcrumb */}
      <div className="wrap pt-7 sm:pt-10">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 text-sm text-charcoal/60 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          All projects
        </Link>
      </div>

      {/* Project Introduction */}
      <section className="wrap pb-8 pt-8 sm:pb-12 sm:pt-12 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {project.category && (
                <span className="border border-charcoal/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal/70">
                  {project.category}
                </span>
              )}

              {project.status && (
                <span
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    project.status === "Ongoing"
                      ? "bg-cyan/15 text-charcoal"
                      : "bg-charcoal/[0.06] text-charcoal/70"
                  }`}
                >
                  {project.status}
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-charcoal/65 sm:text-base sm:leading-8">
                {project.description}
              </p>
            )}
          </div>

          {/* Project Information */}
          <div className="grid grid-cols-2 gap-4 border-t border-charcoal/10 pt-5 lg:grid-cols-1 lg:gap-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            {project.location && (
              <div>
                <div className="flex items-center gap-2 text-charcoal/45">
                  <MapPin size={15} aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Location
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium leading-6">
                  {project.location}
                </p>
              </div>
            )}

            {project.year && (
              <div>
                <div className="flex items-center gap-2 text-charcoal/45">
                  <CalendarDays size={15} aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Year
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium">{project.year}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Project Image */}
      {featuredImage && (
        <section className="wrap">
          <div className="group relative overflow-hidden bg-[#e9e5df]">
            {!coverError ? (
              <img
                src={featuredImage}
                alt={`${project.title} — featured project`}
                width="1600"
                height="900"
                decoding="async"
                onError={() => setCoverError(true)}
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:aspect-[2/1]"
              />
            ) : (
              <ProjectImageFallback
                label="Featured project image unavailable"
                className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1]"
              />
            )}

            {!coverError && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-4 text-white sm:p-7 lg:p-9">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/75 sm:text-xs">
                      Glass n Wood
                    </p>

                    <p className="mt-1 font-serif text-xl sm:text-2xl">
                      Designed around you.
                    </p>
                  </div>

                  {gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openGallery(0)}
                      className="inline-flex shrink-0 items-center gap-2 border border-white/50 bg-black/20 px-3 py-2.5 text-xs backdrop-blur-md transition-colors hover:bg-white hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-4 sm:py-3"
                    >
                      <Images size={16} aria-hidden="true" />
                      View gallery
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Project Gallery */}
      {gallery.length > 0 && (
        <section className="wrap py-16 sm:py-20 lg:py-28">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="eyebrow">Inside the project</p>

              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                Project gallery
              </h2>
            </div>

            <p className="hidden text-sm text-charcoal/50 sm:block">
              {gallery.length} {gallery.length === 1 ? "image" : "images"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => openGallery(index)}
                aria-label={`View image ${index + 1}: ${
                  image.alt || project.title
                }`}
                className={`group relative overflow-hidden bg-[#e9e5df] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan ${
                  index === 0 ? "col-span-2 lg:col-span-2" : ""
                }`}
              >
                <img
                  src={image.src}
                  alt={
                    image.alt || `${project.title} gallery image ${index + 1}`
                  }
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                  className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                    index === 0
                      ? "aspect-[16/9]"
                      : "aspect-[4/3] sm:aspect-[5/4]"
                  }`}
                />

                <div className="absolute inset-0 hidden items-center justify-center bg-stone px-3 text-center text-sm text-charcoal/55">
                  Image unavailable
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white sm:p-5">
                  <span className="text-xs font-medium sm:text-sm">
                    {image.alt || `View image ${index + 1}`}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-black/10 transition-colors group-hover:bg-white group-hover:text-charcoal">
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="border-t border-charcoal/10 bg-stone/20">
          <div className="wrap py-16 sm:py-20 lg:py-24">
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
              <div>
                <p className="eyebrow">More from our portfolio</p>

                <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                  Related projects
                  <span className="text-wood">.</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal/60 sm:text-base">
                  Explore more spaces and craftsmanship by Glass n Wood.
                </p>
              </div>

              <Link
                to="/projects"
                className="hidden shrink-0 items-center gap-2 border-b border-charcoal/30 pb-1 text-sm font-medium transition-colors hover:border-wood hover:text-wood sm:inline-flex"
              >
                All projects
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((related) => (
                <Link
                  key={related.slug}
                  to={`/projects/${encodeURIComponent(related.slug)}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  <div className="relative overflow-hidden bg-stone/45">
                    {related.cover ? (
                      <img
                        src={related.cover}
                        alt={related.title || "Related project"}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}

                    <div
                      className={`${
                        related.cover ? "hidden" : ""
                      } flex aspect-[4/3] items-center justify-center bg-stone/45`}
                    >
                      <span className="font-serif text-lg text-charcoal/50">
                        Glass n Wood
                      </span>
                    </div>

                    {related.status && (
                      <span
                        className={`absolute left-3 top-3 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          related.status === "Ongoing"
                            ? "bg-cyan/90 text-charcoal"
                            : "bg-paper/95 text-charcoal"
                        }`}
                      >
                        {related.status}
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center bg-paper text-charcoal transition-colors group-hover:bg-charcoal group-hover:text-white">
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div>
                      {related.category && (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-wood">
                          {related.category}
                        </p>
                      )}

                      <h3 className="mt-2 font-serif text-xl leading-snug transition-colors group-hover:text-wood sm:text-2xl">
                        {related.title}
                      </h3>

                      {related.location && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-charcoal/55">
                          <MapPin size={13} aria-hidden="true" />
                          {related.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/projects"
              className="mt-8 inline-flex items-center gap-2 bg-charcoal px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-wood sm:hidden"
            >
              Explore all projects
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      {/* Enquiry CTA */}
      <section className="bg-[#eae6df]">
        <div className="wrap py-14 sm:py-20 lg:py-24">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Have a similar vision?</p>

              <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Let&apos;s create a space that feels like yours.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-charcoal/65 sm:text-base">
                Tell us what you have in mind. We&apos;ll help you explore the
                possibilities for your home or commercial space.
              </p>
            </div>

            <Link
              to={`/contact?project=${encodeURIComponent(project.slug)}`}
              className="inline-flex w-fit shrink-0 items-center justify-center gap-3 bg-charcoal px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-wood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Enquire about a similar project
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Image Lightbox */}
      {activeImage !== null && gallery.length > 0 && (
        <Lightbox
          images={gallery}
          index={activeImage}
          onIndex={setActiveImage}
          onClose={closeGallery}
        />
      )}
    </article>
  );
}
