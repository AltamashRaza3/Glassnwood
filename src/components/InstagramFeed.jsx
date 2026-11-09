import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Instagram, RefreshCw, ArrowUpRight } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const INSTAGRAM_API = `${API_BASE}/api/instagram`;
const INSTAGRAM_PROFILE = "https://www.instagram.com/glassnwood.in/";

function getEmbedUrl(post) {
  if (post.embedUrl) return post.embedUrl;

  if (post.shortcode && ["reel", "post"].includes(post.type)) {
    const type = post.type === "post" ? "p" : "reel";

    return `https://www.instagram.com/${type}/${post.shortcode}/embed/`;
  }

  return null;
}

function InstagramCard({ post }) {
  const embedUrl = getEmbedUrl(post);

  return (
    <article className="group min-w-0 overflow-hidden border border-charcoal/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Instagram embed */}
      {embedUrl ? (
        <div className="relative w-full overflow-hidden bg-stone">
          <iframe
            src={embedUrl}
            title={`Glass n Wood Instagram ${post.type}`}
            loading="lazy"
            scrolling="no"
            allow="encrypted-media; clipboard-write"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="block w-full border-0"
            style={{
              height: "620px",
              overflow: "hidden",
            }}
          />
        </div>
      ) : (
        <a
          href={post.url || INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[300px] items-center justify-center bg-stone"
        >
          <span className="flex items-center gap-2 text-sm text-wood">
            View on Instagram
            <ExternalLink size={15} />
          </span>
        </a>
      )}

      {/* Card footer */}
      <div className="flex items-center justify-between gap-3 border-t border-charcoal/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Instagram size={16} className="shrink-0 text-wood" />

          <span className="truncate text-xs font-medium tracking-wide text-charcoal/70">
            @glassnwood.in
          </span>
        </div>

        <a
          href={post.url || INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Instagram post"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-wood transition-colors hover:text-charcoal"
        >
          View post
          <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
}

function InstagramSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[680px] animate-pulse border border-charcoal/10 bg-charcoal/5"
        />
      ))}
    </div>
  );
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(INSTAGRAM_API, {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
            result.message ||
            "Unable to load Instagram posts.",
        );
      }

      const apiPosts = Array.isArray(result.data) ? result.data : [];

      const validPosts = apiPosts.filter(
        (post) => post.shortcode && ["reel", "post"].includes(post.type),
      );

      setPosts(validPosts);
    } catch (err) {
      setPosts([]);

      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <section className="w-full" aria-label="Glass n Wood Instagram feed">
      {/* Feed heading */}
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-charcoal/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Instagram size={17} className="text-wood" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wood">
              Instagram feed
            </span>
          </div>

          <h3 className="font-serif text-2xl text-charcoal sm:text-3xl">
            Follow our journey.
          </h3>

          <p className="mt-2 text-sm text-charcoal/60">
            Interior inspiration, completed spaces and moments from our work.
          </p>
        </div>

        <a
          href={INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-3 border border-charcoal/20 px-5 py-3 text-sm font-semibold text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-white"
        >
          @glassnwood.in
          <ArrowUpRight size={16} />
        </a>
      </div>

      {/* Loading */}
      {loading ? (
        <InstagramSkeleton />
      ) : error ? (
        <div className="border border-charcoal/10 bg-stone/50 px-6 py-12 text-center">
          <Instagram size={30} className="mx-auto text-wood" />

          <p className="mt-4 text-sm text-charcoal/70">{error}</p>

          <button
            type="button"
            onClick={loadPosts}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-wood hover:underline"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <InstagramCard key={post._id || post.shortcode} post={post} />
          ))}
        </div>
      ) : (
        <div className="border border-charcoal/10 bg-stone/50 px-6 py-14 text-center">
          <Instagram size={34} className="mx-auto text-wood" />

          <h4 className="mt-4 font-serif text-2xl text-charcoal">
            More inspiration coming soon.
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">
            Follow us on Instagram to discover our latest interiors, projects
            and behind-the-scenes moments.
          </p>

          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-wood hover:underline"
          >
            Visit Instagram
            <ExternalLink size={15} />
          </a>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 flex justify-center">
        <a
          href={INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-b border-wood pb-1 text-sm font-semibold text-charcoal transition-colors hover:text-wood"
        >
          Explore more on Instagram
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
