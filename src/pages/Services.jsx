import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import { services } from "../data/site.js";
import ServiceCard from "../components/ServiceCard.jsx";

export default function Services() {
  useSeo(
    "Our Services | Glass n Wood",
    "Explore Glass n Wood services, including glasswork, woodwork, custom furniture, commercial interiors, gym fit-outs and social media advertising design.",
  );

  return (
    <main className="pb-20">
      {/* Hero */}
      <section className="wrap pt-8 md:pt-12">
        <p className="eyebrow">What we do</p>

        <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Crafted for your space.
          <span className="block text-wood">Designed for your business.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal/70 md:text-lg md:leading-8">
          From bespoke glass and woodwork to custom furniture, commercial
          interiors and advertising creatives, we help bring your ideas to life.
        </p>
      </section>

      {/* Dynamic service cards */}
      <section className="wrap mt-12 md:mt-16" aria-label="Our services">
        <div className="mb-8 flex items-center justify-between border-b border-charcoal/15 pb-4">
          <p className="text-sm text-charcoal/60">Our capabilities</p>
          <p className="text-sm text-charcoal/60">
            {String(services.length).padStart(2, "0")} services
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="wrap mt-20 md:mt-28">
        <div className="bg-charcoal px-6 py-10 text-paper sm:px-10 md:flex md:items-center md:justify-between md:gap-8 md:px-14 md:py-14">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-paper/60">
              Have something in mind?
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Let&apos;s create something meaningful.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-paper/70">
              Tell us about your space, furniture requirements or advertising
              project. We&apos;ll help you explore the right solution.
            </p>
          </div>

          <Link
            to="/contact"
            className="mt-7 inline-flex shrink-0 items-center gap-3 bg-paper px-6 py-3.5 text-sm font-medium text-charcoal transition-colors hover:bg-cyan hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan md:mt-0"
          >
            Request a quote
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
