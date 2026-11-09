import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ p, className = "" }) {
  const [imageError, setImageError] = useState(false);

  const imageAlt =
    p?.gallery?.[0]?.alt ||
    `${p?.title || "Glass n Wood project"}${
      p?.category ? ` – ${p.category}` : ""
    }`;

  const hasImage =
    typeof p?.cover === "string" && p.cover.trim().length > 0 && !imageError;

  if (!p?.slug) return null;

  return (
    <Link
      to={`/projects/${encodeURIComponent(p.slug)}`}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-4 ${className}`}
      aria-label={`View ${p.title || "project"} details`}
    >
      {/* Project Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        {hasImage ? (
          <img
            src={p.cover}
            alt={imageAlt}
            width="800"
            height="600"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-stone px-4 text-center text-sm text-charcoal/60"
            aria-label="Project image unavailable"
          >
            Project image coming soon
          </div>
        )}

        {/* Subtle image overlay */}
        {hasImage && (
          <div className="pointer-events-none absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/10" />
        )}
      </div>

      {/* Project Details */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <h3 className="font-serif text-xl leading-snug text-charcoal transition-colors duration-300 group-hover:text-cyan-dark">
          {p.title || "Untitled project"}
        </h3>

        {p.status && (
          <span
            className={`shrink-0 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
              p.status === "Ongoing" ? "text-ember" : "text-wood"
            }`}
          >
            {p.status}
          </span>
        )}
      </div>

      {/* Project Metadata */}
      <p className="mt-1 text-sm leading-6 text-charcoal/60">
        {[p.category, p.location, p.year].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}
