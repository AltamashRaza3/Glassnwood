import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, RotateCcw } from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import ProjectCard from "../components/ProjectCard.jsx";

const STATUS_FILTERS = ["All", "Completed", "Ongoing"];

function FilterButton({ active, children, onClick, label }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-cyan focus-visible:ring-offset-2",
        active
          ? "border-charcoal bg-charcoal text-paper"
          : "border-charcoal/20 bg-transparent text-charcoal hover:border-cyan hover:bg-cyan/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ProjectSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[4/3] bg-stone" />
      <div className="mt-4 h-5 w-3/4 bg-stone" />
      <div className="mt-3 h-4 w-1/2 bg-stone" />
    </div>
  );
}

function ProjectError({ error }) {
  return (
    <div
      className="flex flex-col items-start border border-charcoal/10 p-8 md:p-12"
      role="alert"
    >
      <h2 className="font-serif text-2xl">
        We couldn&apos;t load the projects.
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal/65">
        Please try again later. If the problem continues, contact us for
        information about our work.
      </p>

      {import.meta.env.DEV && error && (
        <p className="mt-3 break-words text-xs text-ember">
          Development details:{" "}
          {typeof error === "string" ? error : error.message || "Unknown error"}
        </p>
      )}
    </div>
  );
}

export default function Projects() {
  useSeo(
    "Our Projects",
    "Explore Glass n Wood projects featuring custom furniture, glass partitions, woodwork, gyms, offices and showrooms in Siwan and nearby areas.",
  );

  const {
    items = [],
    status = "idle",
    error = null,
  } = useSelector((state) => state.projects ?? {});

  const [category, setCategory] = useState("All");
  const [projectStatus, setProjectStatus] = useState("All");

  // Only use valid project records returned by the API.
  const validProjects = useMemo(
    () =>
      Array.isArray(items)
        ? items.filter(
            (project) =>
              project &&
              typeof project.slug === "string" &&
              typeof project.title === "string",
          )
        : [],
    [items],
  );

  // Generate categories dynamically from database records.
  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        validProjects
          .map((project) => project.category)
          .filter((value) => typeof value === "string" && value.trim())
          .sort((a, b) => a.localeCompare(b)),
      ),
    ],
    [validProjects],
  );

  // Filter projects without modifying the Redux data.
  const filteredProjects = useMemo(
    () =>
      validProjects.filter(
        (project) =>
          (category === "All" || project.category === category) &&
          (projectStatus === "All" || project.status === projectStatus),
      ),
    [validProjects, category, projectStatus],
  );

  const hasActiveFilters = category !== "All" || projectStatus !== "All";

  const isLoading = status === "loading" || status === "idle";
  const hasError = status === "error";

  function resetFilters() {
    setCategory("All");
    setProjectStatus("All");
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Page heading */}
      <section className="wrap pt-8 md:pt-12">
        <div className="max-w-5xl">
          <p className="eyebrow">Our portfolio</p>

          <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-5xl lg:text-6xl">
            Work that speaks
            <span className="text-wood"> for itself.</span>
          </h1>

          <div className="mt-2 max-w-xl">
            <p className="text-base leading-7 text-charcoal/70 md:text-lg md:leading-8">
              Explore our work across homes, gyms, offices and showrooms,
              including custom furniture, glasswork and woodwork.
            </p>

            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 font-medium text-cyan-dark transition-colors duration-300 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              Discuss your project
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="wrap mt-7 md:mt-7" aria-label="Project filters">
        <div className="border-y border-charcoal/10 py-5">
          <div className="flex flex-col gap-5">
            {/* Category filters */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/55">
                Project type
              </p>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter projects by category"
              >
                {categories.map((item) => (
                  <FilterButton
                    key={item}
                    active={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </FilterButton>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-charcoal/55">
                Project status
              </p>

              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filter projects by status"
              >
                {STATUS_FILTERS.map((item) => (
                  <FilterButton
                    key={item}
                    active={projectStatus === item}
                    onClick={() => setProjectStatus(item)}
                  >
                    {item}
                  </FilterButton>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 text-sm text-charcoal/65 underline-offset-4 hover:text-charcoal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project results */}
      <section
        className="wrap mt-8 md:mt-10"
        aria-label="Project results"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <p className="sr-only" role="status">
              Loading projects
            </p>

            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          </>
        ) : hasError ? (
          <ProjectError error={error} />
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center md:py-24">
            <BriefcaseBusiness
              size={32}
              strokeWidth={1.4}
              className="text-charcoal/40"
              aria-hidden="true"
            />

            <h2 className="mt-5 font-serif text-2xl">
              {validProjects.length === 0
                ? "Our portfolio is being updated."
                : "No matching projects."}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/65">
              {validProjects.length === 0
                ? "Get in touch to discuss your requirements and learn more about our work."
                : "Try a different category or status to explore more projects."}
            </p>

            {validProjects.length > 0 && hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 border border-charcoal/20 px-5 py-3 text-sm transition-colors hover:border-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Reset filters
              </button>
            )}

            {validProjects.length === 0 && (
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 bg-charcoal px-5 py-3 text-sm text-paper transition-colors hover:bg-cyan-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2"
              >
                Contact us
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p
                className="text-sm text-charcoal/60"
                aria-live="polite"
                aria-atomic="true"
              >
                Showing{" "}
                <span className="font-medium text-charcoal">
                  {filteredProjects.length}
                </span>{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.slug} p={project} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
