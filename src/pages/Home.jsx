import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  House,
  Dumbbell,
  Building2,
  Store,
  MessageCircle,
  Ruler,
  BadgeCheck,
  MessagesSquare,
  ExternalLink,
} from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import Reveal from "../components/Reveal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import InstagramFeed from "../components/InstagramFeed.jsx";
import { services } from "../data/site.js";
import { siteImages } from "../data/siteImages.js";
import { business } from "../data/site";

const googleReviewsUrl = "https://share.google/pEfe2oGTzOhw6ODBW";

const reasonsToChooseUs = [
  {
    title: "Made for your space",
    text: "Solutions shaped around your measurements, requirements and the way you use your space.",
    Icon: Ruler,
  },
  {
    title: "Careful finishing",
    text: "We pay attention to material choices, practical details and the finishing touches.",
    Icon: BadgeCheck,
  },
  {
    title: "Homes and businesses",
    text: "Glasswork, woodwork and interior solutions for homes, gyms, offices and showrooms.",
    Icon: Building2,
  },
  {
    title: "Personal project support",
    text: "Discuss your ideas directly with our team and explore a suitable solution for your needs.",
    Icon: MessagesSquare,
  },
];

const serviceTypes = [
  { title: "Homes", subtitle: "Custom interiors", Icon: House },
  { title: "Gyms", subtitle: "Functional spaces", Icon: Dumbbell },
  { title: "Offices", subtitle: "Modern workspaces", Icon: Building2 },
  { title: "Showrooms", subtitle: "Premium finishes", Icon: Store },
];

export default function Home() {
  useSeo(
    "",
    "Glass n Wood creates glasswork, custom woodwork, furniture and commercial interiors in Siwan, Bihar. Discuss your project with our team.",
  );

  const { items = [], status } = useSelector((state) => state.projects);
  const featuredProjects = items.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-charcoal text-paper md:min-h-[78vh]">
        <img
          src={siteImages.hero}
          alt="Contemporary living room with warm wood finishes and elegant furniture"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-black/10" />

        <div className="wrap w-full py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow text-woodn">
              Siwan, Bihar
              <span className="ml-4 inline-block w-12 align-middle border-t" />
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Glass and wood,
              <span className="block text-wood">made to be lived in.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Glasswork, woodwork, custom furniture and commercial interiors,
              crafted for homes, gyms, offices and showrooms.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                to="/projects"
                className="btn inline-flex items-center gap-2 !bg-white !text-charcoal shadow-md transition-colors hover:!bg-woodn hover:!text-charcoal"
              >
                <span>View Projects</span>
                <ArrowRight
                  size={17}
                  className="!text-charcoal"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/contact"
                className="btn-ghost border border-white/70 text-white transition hover:bg-white hover:text-charcoal"
              >
                <MessageCircle size={17} />
                Start an enquiry
              </Link>
            </div>
          </div>

          {/* Service categories */}
          <div className="mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/25 pt-6 sm:grid-cols-4">
            {serviceTypes.map(({ title, subtitle, Icon }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon
                  size={25}
                  strokeWidth={1.5}
                  className="shrink-0 text-woodn"
                />

                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs text-white/70">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="wrap py-12 md:py-16">
        <Reveal>
          <div className="max-w-4xl">
            <p className="eyebrow">Selected work</p>

            <h2 className="mt-2 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Featured <span className="text-wood">projects.</span>
            </h2>

            <div className="mt-3 max-w-xl">
              <p className="text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
                A glimpse of our work in homes, gyms, offices and showrooms
                across Siwan and nearby areas.
              </p>

              <Link
                to="/projects"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-dark transition-colors duration-300 hover:text-charcoal"
              >
                View all projects
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </Reveal>

        {status === "error" ? (
          <p className="mt-8 text-sm text-ember" role="alert">
            Projects could not be loaded right now. Please try again later.
          </p>
        ) : status !== "ready" ? (
          <p className="mt-8 text-sm text-charcoal/60">Loading projects…</p>
        ) : featuredProjects.length === 0 ? (
          <p className="mt-8 text-sm text-charcoal/60">
            Our project gallery is being updated. Please check back soon.
          </p>
        ) : (
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal
                key={
                  project.id ||
                  project.slug ||
                  project.title ||
                  `featured-project-${index}`
                }
              >
                <ProjectCard p={project} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section className="bg-stone/50 py-16 md:py-24">
        <div className="wrap">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">What we do</p>

                <h2 className="mt-3 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                  Thoughtful solutions for{" "}
                  <span className="text-wood">every space.</span>
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
                From a single piece of custom furniture to complete commercial
                interiors, we combine practical design, quality materials and
                careful finishing.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {services.slice(0, 4).map((service, index) => (
              <Reveal
                key={
                  service.id ||
                  service.slug ||
                  service.title ||
                  `service-${index}`
                }
              >
                <article className="group h-full overflow-hidden border border-charcoal/10 bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                    <img
                      src={service.image}
                      alt={service.alt || service.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <span className="absolute left-5 top-5 bg-paper px-3 py-1.5 text-xs font-medium tracking-wide text-charcoal">
                      SERVICE {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex h-full flex-col p-5 sm:p-6">
                    <h3 className="font-serif text-xl leading-snug text-charcoal sm:text-2xl">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
                      {service.text}
                    </p>

                    <Link
                      to="/contact"
                      className="mt-6 inline-flex items-center gap-2 border-t border-charcoal/10 pt-4 text-sm font-medium text-cyan-dark transition group-hover:gap-3"
                    >
                      Discuss your project <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Bottom CTA */}

          {/* Bottom CTA */}
          <div className="mt-12 flex flex-col gap-6 border-t border-charcoal/15 pt-8 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:pt-9">
            <div className="max-w-xl">
              <p className="eyebrow">Have a project in mind?</p>

              <h3 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-charcoal sm:text-3xl">
                Let's create something
                <span className="text-wood"> exceptional.</span>
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-7 text-charcoal/65 sm:text-base">
                Tell us about your space, furniture or business requirements.
                We'll discuss your needs and explore a suitable solution.
              </p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-4 bg-black px-7 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 sm:w-auto"
            >
              Get in touch
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="wrap grid items-center gap-8 py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:py-16 lg:gap-16">
        <Reveal>
          <img
            src={siteImages.craftsmanship}
            alt="Contemporary interior featuring natural materials and refined finishes"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] md:aspect-[4/3]"
          />
        </Reveal>

        <Reveal>
          <p className="eyebrow">Craftsmanship</p>

          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            Measured, cut and finished with care.
          </h2>

          <p className="mt-5 text-sm leading-7 text-charcoal/75 sm:text-base sm:leading-8">
            Every project begins with understanding your space, your needs and
            your vision. We carefully consider materials, measurements and
            finishes to create a solution that feels right for you.
          </p>

          <p className="mt-4 text-sm leading-7 text-charcoal/75 sm:text-base sm:leading-8">
            From bespoke furniture and custom woodwork to glass partitions and
            complete interiors, we bring functionality and thoughtful
            craftsmanship together to make the most of every space.
          </p>

          <Link
            to="/about"
            className="group mt-7 inline-flex min-h-12 items-center justify-center gap-3 bg-black px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          >
            Discover our approach
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </section>

      {/* Why choose Glass n Wood */}
      <section className="bg-paper py-16 md:py-20">
        <div className="wrap">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">The {business.name} difference</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                Thoughtful work,{" "}
                <span className="text-wood">built around you.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
                Every space has its own needs. We help you explore practical
                glass, wood and interior solutions that suit your project and
                your style.
              </p>
            </div>
          </Reveal>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasonsToChooseUs.map(({ title, text, Icon }, index) => (
              <Reveal key={title}>
                <article className="h-full border border-charcoal/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center bg-stone/70 text-cyan-dark">
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-xs font-medium tracking-[0.16em] text-charcoal/45">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-charcoal">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-charcoal/70">
                    {text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Google reviews */}
      <section className="wrap py-16 md:py-20">
        <Reveal>
          <div className="relative overflow-hidden border border-charcoal/10 bg-stone/45 px-6 py-8 sm:px-9 sm:py-10 md:flex md:items-center md:justify-between md:gap-8 md:px-12">
            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-charcoal/10" />
            <div className="relative max-w-2xl">
              <p className="eyebrow">Customer feedback</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
                Have a look at our{" "}
                <span className="text-wood">Google reviews.</span>
              </h2>
              <p className="mt-4 text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
                Explore feedback shared by customers on our Google business
                listing. If we have worked with you, your review helps others
                discover our work.
              </p>
            </div>
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn relative mt-6 inline-flex shrink-0 items-center gap-2 bg-charcoal text-paper transition"
            >
              Read Google reviews
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Instagram */}
      <section className="wrap pb-12 md:pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Follow our work</p>

            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
              On Instagram<span className="text-wood">.</span>
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-charcoal/70 sm:text-base">
              Discover our latest work, interior ideas and behind-the-scenes
              moments.
            </p>
          </div>

          <a
            href="https://instagram.com/glassnwood.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Glass n Wood on Instagram"
            className="group inline-flex min-h-12 w-fit items-center justify-center gap-3 bg-black px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
          >
            @glassnwood.in
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>

        <InstagramFeed />
      </section>

      {/* Contact CTA */}
      <section className="wrap pb-12 md:pb-16">
        <div className="relative overflow-hidden border border-charcoal/10 bg-stone/45 px-6 py-8 sm:px-9 sm:py-10 md:flex md:items-center md:justify-between md:gap-8 md:px-12 md:py-12">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-charcoal/10" />
          <div className="pointer-events-none absolute -right-4 -top-5 h-28 w-28 rounded-full border border-charcoal/10" />

          <div className="relative max-w-2xl">
            <p className="eyebrow">Let's build something meaningful</p>

            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
              Planning a space? Let's talk about it.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-charcoal/70 sm:text-base sm:leading-7">
              Tell us about your home, office, showroom or custom furniture
              project. We will help you explore the next step.
            </p>
          </div>

          <Link
            to="/contact"
            className="group relative mt-6 inline-flex min-h-12 shrink-0 items-center justify-center gap-3 bg-black px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 md:mt-0"
          >
            Discuss your project
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
