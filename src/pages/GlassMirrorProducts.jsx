import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";

const categories = [
  "All Products",
  "Decorative Glass",
  "Architectural Glass",
  "Decorative Mirrors",
  "Designer Mirrors",
];

export default function GlassMirrorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  // Fetch published products from the backend
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const items = await getProducts();

        if (!cancelled) {
          setProducts(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load products.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter products by category and search query
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All Products" ||
        product.category === activeCategory;

      const searchableText = [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  // Enquiry action
  function enquire(product) {
    const message = `Hello Glass n Wood, I would like to enquire about ${product.name}. Please share the available designs, sizes and pricing.`;

    // Add your WhatsApp business number without + or spaces.
    // Example format: 919876543210
    const whatsappNumber = "";

    if (!whatsappNumber) {
      window.location.href = `/contact?product=${encodeURIComponent(
        product.name,
      )}`;
      return;
    }

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="bg-paper text-charcoal">
      {/* Hero */}
      <section className="wrap pb-16 pt-8 sm:pb-20 sm:pt-10 lg:pt-12">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-wood">
          Glass n Wood · Product Collection
        </p>

        <div className="mt-5 grid gap-4">
          <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-5xl lg:text-6xl">
            Glass &amp; Mirrors
            <span className="text-wood"> for distinctive spaces.</span>
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-charcoal/65 sm:text-base">
            Discover glass and mirror finishes for interiors, furniture,
            partitions and bespoke installations. Find a design you love and
            enquire about your requirements.
          </p>
        </div>
      </section>

      {/* Collection banner */}
      <section className="wrap">
        <div className="relative min-h-[260px] overflow-hidden bg-[#D9D0C4] sm:min-h-[360px]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85"
            alt="Contemporary interior with refined architectural finishes"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

          <div className="relative flex min-h-[260px] max-w-xl flex-col items-start justify-end p-6 text-white sm:min-h-[360px] sm:p-10 lg:p-14">
            <p className="text-xs uppercase tracking-[0.22em] text-white/75">
              Material · Texture · Light
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">
              Details define the space.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
              Explore finishes for projects that deserve a considered touch.
            </p>
          </div>
        </div>
      </section>

      {/* Product catalogue */}
      <section className="wrap py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-wood">
              Explore the collection
            </p>

            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Find your finish
            </h2>
          </div>

          <label className="flex w-full items-center gap-3 border border-charcoal/15 bg-white px-4 md:max-w-xs">
            <Search size={17} className="shrink-0 text-charcoal/50" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search glass or mirrors..."
              aria-label="Search products"
              className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-charcoal/45"
            />
          </label>
        </div>

        {/* Category filters */}
        <div className="mt-7 flex gap-2 overflow-x-auto border-b border-charcoal/10 pb-5">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`shrink-0 px-4 py-2.5 text-sm transition ${
                activeCategory === category
                  ? "bg-charcoal text-paper"
                  : "border border-charcoal/10 text-charcoal/70 hover:border-cyan hover:text-charcoal"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading products"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-charcoal/10" />
                <div className="mt-4 h-3 w-1/3 bg-charcoal/10" />
                <div className="mt-3 h-6 w-2/3 bg-charcoal/10" />
                <div className="mt-3 h-4 w-full bg-charcoal/10" />
                <div className="mt-2 h-4 w-4/5 bg-charcoal/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-20 text-center">
            <h3 className="font-serif text-2xl">
              Products could not be loaded
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-charcoal/60">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 bg-charcoal px-5 py-3 text-sm text-paper transition hover:bg-wood"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="font-serif text-2xl">
              Our collection is being prepared
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal/60">
              New glass and mirror designs will appear here soon. Please contact
              us for current availability.
            </p>

            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 bg-charcoal px-5 py-3 text-sm text-paper transition hover:bg-wood"
            >
              Contact us
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* No filter matches */}
        {!loading &&
          !error &&
          products.length > 0 &&
          visibleProducts.length === 0 && (
            <div className="py-20 text-center">
              <h3 className="font-serif text-2xl">No matching products</h3>

              <p className="mt-2 text-sm text-charcoal/60">
                Try a different search or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All Products");
                }}
                className="mt-5 border-b border-charcoal/30 pb-1 text-sm hover:text-wood"
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Product cards */}
        {!loading && !error && visibleProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => {
              const image = product.images?.[0]?.src || "";

              return (
                <article
                  key={product._id || product.slug}
                  className="group min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => enquire(product)}
                    aria-label={`Enquire about ${product.name}`}
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-charcoal/5 text-left"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EDE7DD] px-6 text-center">
                        <span className="font-serif text-xl text-charcoal/50">
                          {product.name}
                        </span>
                      </div>
                    )}

                    <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-paper text-charcoal transition-colors group-hover:bg-charcoal group-hover:text-paper">
                      <ArrowUpRight size={20} />
                    </span>
                  </button>

                  <div className="pt-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-wood">
                      {product.category}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl">{product.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-charcoal/65">
                      {product.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => enquire(product)}
                      className="mt-5 inline-flex items-center gap-2 border-b border-charcoal/25 pb-2 text-sm transition-colors hover:border-wood hover:text-wood"
                    >
                      <MessageCircle size={16} />
                      Enquire about this product
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Enquiry CTA */}
      <section className="bg-[#EDE7DD]">
        <div className="wrap flex flex-col justify-between gap-6 py-12 sm:py-16 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-wood">
              Made for your space
            </p>

            <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
              Have a specific glass or mirror design in mind?
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-charcoal/65">
              Tell us about your dimensions, finish and installation
              requirements.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex w-fit shrink-0 items-center gap-2 bg-charcoal px-5 py-3.5 text-sm text-paper transition-colors hover:bg-wood"
          >
            Discuss your requirements
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
