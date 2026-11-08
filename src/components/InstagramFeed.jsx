import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Instagram, Play, RefreshCw } from "lucide-react";

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
    <section className="w-full" aria-label="Instagram posts">
      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse bg-charcoal/5"
            />
          ))}
        </div>
      ) : error ? (
        /* API error */
        <div className="border border-charcoal/15 bg-stone/50 p-8 text-center">
          <Instagram size={32} className="mx-auto text-wood" />

          <p className="mt-3 text-sm text-charcoal/70">{error}</p>

          <button
            type="button"
            onClick={loadPosts}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-wood hover:underline"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Instagram heading */}
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-wood">
                @glassnwood.in
              </p>

              <p className="mt-2 text-sm text-charcoal/55">
                Discover our latest inspiration
              </p>
            </div>

            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Glass n Wood on Instagram"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-charcoal/15 transition-colors hover:border-wood hover:bg-wood hover:text-white"
            >
              <Instagram size={20} />
            </a>
          </div>

          {/* MongoDB posts */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 items-start gap-5 min-[420px]:grid-cols-2 md:grid-cols-3">
              {posts.map((post) => {
                const embedUrl = getEmbedUrl(post);

                return (
                  <article
                    key={post._id || post.shortcode}
                    className="group overflow-hidden bg-stone"
                  >
                    {embedUrl ? (
                      <div className="relative aspect-[4/5] overflow-hidden bg-charcoal/5">
                        <iframe
                          src={embedUrl}
                          title={`Glass n Wood Instagram ${post.type}`}
                          loading="lazy"
                          allow="encrypted-media; clipboard-write"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          className="absolute inset-0 h-full w-full border-0"
                        />
                      </div>
                    ) : (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex aspect-[4/5] items-center justify-center bg-charcoal/5"
                      >
                        <span className="flex items-center gap-2 text-sm text-wood">
                          View on Instagram
                          <ExternalLink size={15} />
                        </span>
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            /* No published posts */
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 border border-charcoal/15 bg-stone/50 p-10 text-center transition hover:border-wood"
            >
              <Instagram size={34} className="text-wood" />

              <p className="font-serif text-2xl">@glassnwood.in</p>

              <p className="max-w-md text-sm text-charcoal/70">
                Our latest projects will appear here once published.
              </p>
            </a>
          )}
        </>
      )}

      {/* Follow Instagram */}
      <a
        href={INSTAGRAM_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost mt-7"
      >
        <Instagram size={17} />
        Follow on Instagram
        <ExternalLink size={14} />
      </a>
    </section>
  );
}
