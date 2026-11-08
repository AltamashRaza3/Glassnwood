import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({ service, index }) {
  return (
    <article className="group min-w-0">
      <Link
        to={`/contact?service=${encodeURIComponent(service.title)}`}
        aria-label={`Enquire about ${service.title}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-stone">
          <img
            src={service.image}
            alt={service.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling?.classList.remove(
                "hidden",
              );
            }}
          />

          <div className="absolute inset-0 hidden items-center justify-center bg-stone px-4 text-center text-sm text-charcoal/60">
            Image coming soon
          </div>

          <span className="absolute left-4 top-4 bg-paper/90 px-3 py-1.5 text-xs tracking-widest text-charcoal backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-charcoal transition-colors duration-300 group-hover:bg-charcoal group-hover:text-paper">
            <ArrowUpRight size={20} aria-hidden="true" />
          </span>
        </div>

        <div className="pt-5">
          <h2 className="font-serif text-2xl tracking-tight transition-colors duration-300 group-hover:text-cyan-dark">
            {service.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            {service.text}
          </p>
        </div>
      </Link>
    </article>
  );
}
