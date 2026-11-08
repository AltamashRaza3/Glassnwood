import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Ruler,
  Layers3,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import { siteImages } from "../data/siteImages.js";
import { business } from "../data/site";

const values = [
  {
    icon: Ruler,
    title: "Precision in Every Detail",
    description:
      "We pay attention to measurements, material selection, installation and finishing to deliver work that fits your space and requirements.",
  },
  {
    icon: Layers3,
    title: "Materials That Work Together",
    description:
      "We bring glass, wood and complementary materials together to create practical, balanced and visually appealing interiors.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Solutions for Every Space",
    description:
      "From residential furniture to commercial interiors, we approach each project according to its purpose, layout and individual needs.",
  },
  {
    icon: Sparkles,
    title: "Designed Around You",
    description:
      "Your preferences and functional requirements guide our approach, helping us create spaces that feel personal and purposeful.",
  },
];

const services = [
  "Glasswork and glass partitions",
  "Woodwork and custom cabinetry",
  "Bespoke furniture and dining tables",
  "Gym and salon interiors",
  "Corporate offices and commercial spaces",
  "Showroom displays and retail interiors",
];

const primaryButton =
  "inline-flex items-center justify-center gap-2 bg-black px-6 py-3.5 text-sm font-medium text-white transition duration-300 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

export default function About() {
  useSeo(
    "About Glass n Wood",
    "Discover Glass n Wood, based in Laxmipur, Siwan, Bihar. We provide glasswork, woodwork, custom furniture and interior solutions for homes, gyms, offices, salons and showrooms.",
  );

  return (
    <main className="wrap pb-20 pt-8 text-charcoal sm:pt-10 md:pb-28 md:pt-12">
      {/* Page introduction */}
      <section aria-labelledby="about-heading">
        <p className="eyebrow">About Glass n Wood</p>

        <h1
          id="about-heading"
          className="mt-3 max-w-none font-serif text-3xl leading-[1.12] tracking-tight sm:text-4xl lg:whitespace-nowrap lg:text-4xl xl:text-5xl"
        >
          Thoughtful craftsmanship.
          <span className="ml-2 block text-wood">
            Spaces made for living and working.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-charcoal/70 md:text-lg">
          {business.name} brings together glasswork, woodwork, custom furniture
          and interior solutions to help transform everyday spaces into
          functional, welcoming and well-finished environments.
        </p>
      </section>

      {/* Our story */}
      <section
        className="mt-14 grid items-center gap-9 md:mt-24 md:grid-cols-2 md:gap-14"
        aria-labelledby="our-story-heading"
      >
        <div className="relative">
          <img
            src={siteImages.aboutWorkshop}
            alt="Glass n Wood interior craftsmanship and material details"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full bg-stone object-cover md:aspect-[5/4]"
          />

          <div className="absolute bottom-4 left-4 bg-paper/95 px-5 py-4 backdrop-blur-sm sm:bottom-6 sm:left-6">
            <p className="text-xs uppercase tracking-[0.2em] text-charcoal/60">
              Based in
            </p>
            <p className="mt-1 font-serif text-lg text-charcoal">
              Siwan, Bihar, India
            </p>
          </div>
        </div>

        <div className="md:py-4">
          <p className="eyebrow">Our Story</p>

          <h2
            id="our-story-heading"
            className="mt-3 font-serif text-3xl leading-snug tracking-tight sm:text-4xl"
          >
            Making the most of every space.
          </h2>

          <div className="mt-6 space-y-5 leading-8 text-charcoal/75">
            <p>
              {business.name} is a glass, woodwork and interior solutions
              business based in Laxmipur, Siwan, Bihar. We work with homeowners
              and businesses looking for practical solutions that complement
              their spaces and their way of working.
            </p>

            <p>
              Our work spans custom furniture, dining tables, glass
              installations, woodwork and interior solutions for gyms, salons,
              offices and showrooms. Each type of space has its own needs, so we
              focus on understanding the requirements before determining the
              right approach.
            </p>

            <p>
              We believe a well-designed space should do more than look good. It
              should work comfortably, make effective use of available space and
              reflect the needs of the people who use it.
            </p>
          </div>

          <Link to="/contact" className={`${primaryButton} mt-8`}>
            Discuss Your Project
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Our approach */}
      <section className="mt-20 md:mt-32" aria-labelledby="approach-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Our Approach</p>

          <h2
            id="approach-heading"
            className="mt-3 font-serif text-3xl leading-snug tracking-tight sm:text-4xl"
          >
            Good work starts with understanding your needs.
          </h2>

          <p className="mt-5 leading-8 text-charcoal/70">
            Every project starts with a different requirement. Our approach is
            to understand the intended use, available space, preferred materials
            and desired finish before moving towards a suitable solution.
          </p>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="border-t border-charcoal/15 pt-5 transition-colors duration-300 hover:border-charcoal"
              >
                <div className="flex h-12 w-12 items-center justify-center bg-stone">
                  <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                </div>

                <h3 className="mt-5 font-serif text-xl tracking-tight">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-charcoal/70">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* What we do */}
      <section
        className="mt-20 grid gap-9 bg-stone p-6 sm:p-10 md:mt-32 md:grid-cols-2 md:items-center md:gap-14 md:p-12"
        aria-labelledby="services-heading"
      >
        <div>
          <p className="eyebrow">What We Do</p>

          <h2
            id="services-heading"
            className="mt-3 font-serif text-3xl leading-snug tracking-tight sm:text-4xl"
          >
            From individual pieces to complete interiors.
          </h2>

          <p className="mt-5 leading-8 text-charcoal/70">
            Whether you are improving one part of your home or planning an
            interior for your business, we offer solutions across glass, wood,
            furniture and commercial spaces.
          </p>

          <Link to="/services" className={`${primaryButton} mt-7`}>
            Explore Our Services
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service} className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-1 shrink-0 text-cyan-dark"
                aria-hidden="true"
              />
              <span className="leading-7 text-charcoal/80">{service}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section
        className="mt-20 border-t border-charcoal/15 pt-12 text-center md:mt-32 md:pt-16"
        aria-labelledby="about-cta-heading"
      >
        <p className="eyebrow">Let's Build Something Together</p>

        <h2
          id="about-cta-heading"
          className="mx-auto mt-3 max-w-3xl font-serif text-3xl leading-snug tracking-tight sm:text-4xl md:text-5xl"
        >
          Have a space in mind? Let's talk about it.
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-charcoal/70">
          Tell us about your home, business or furniture requirements. We would
          be happy to discuss your project and explore suitable options with
          you.
        </p>

        <Link to="/contact" className={`${primaryButton} mt-8`}>
          Get in Touch
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
