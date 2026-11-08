import { Link } from "react-router-dom";

export default function ProjectCard({ p, className = "" }) {
  return (
    <Link to={`/projects/${p.slug}`} className={`group block ${className}`}>
      {/* Project Image */}
      <div className="overflow-hidden bg-stone">
        {p.cover ? (
          <img
            src={p.cover}
            alt={`${p.title || "Project"}${p.category ? ` – ${p.category}` : ""}`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}

        {/* Fallback if the image is missing or fails to load */}
        <div
          className={`flex aspect-[4/3] items-center justify-center bg-stone px-4 text-center text-sm text-charcoal/60 ${
            p.cover ? "hidden" : ""
          }`}
        >
          Project image coming soon
        </div>
      </div>

      {/* Project Details */}
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="text-xl transition-colors group-hover:text-cyan-dark">
          {p.title}
        </h3>

        {p.status && (
          <span
            className={`shrink-0 text-xs uppercase tracking-widest ${
              p.status === "Ongoing" ? "text-ember" : "text-wood"
            }`}
          >
            {p.status}
          </span>
        )}
      </div>

      <p className="text-sm text-charcoal/60">
        {p.category}
        {p.location ? ` · ${p.location}` : ""}
        {p.year ? ` · ${p.year}` : ""}
      </p>
    </Link>
  );
}
