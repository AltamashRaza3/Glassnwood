import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import logo from "../assets/images/logo1.png";
import { business, nav } from "../data/site.js";
import { loadProjects } from "../store/index.js";

const footerServices = [
  "Glasswork",
  "Woodwork",
  "Custom Furniture",
  "Commercial Interiors",
  "Gym & Salon Interiors",
  "Showrooms & Retail",
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadProjects());
  }, [dispatch]);

  // Close the drawer and reset scroll when the route changes.
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const instagramHandle = business.instagram
    ? new URL(business.instagram).pathname.replaceAll("/", "")
    : "";

  return (
    <>
      {/* Skip Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-paper focus:p-3 focus:text-charcoal"
      >
        Skip to content
      </a>

      {/* Responsive Header */}
      <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-paper/95 backdrop-blur-xl">
        <div className="wrap flex h-[68px] items-center justify-between gap-4 sm:h-20">
          {/* Brand */}
          <Link
            to="/"
            aria-label={`${business.name} home`}
            onClick={closeMenu}
            className="flex shrink-0 items-center"
          >
            <img
              src={logo}
              alt={business.name}
              className="h-11 w-auto max-w-[140px] object-contain sm:h-14 sm:max-w-[180px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 lg:flex xl:gap-8"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative whitespace-nowrap py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? "font-medium text-charcoal after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-cyan"
                      : "text-charcoal/70 hover:text-charcoal"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile / Tablet Menu Toggle */}
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((previous) => !previous)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/10 bg-white/70 text-charcoal transition-colors hover:border-cyan/50 hover:bg-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan lg:hidden"
          >
            {open ? (
              <X size={21} strokeWidth={1.8} />
            ) : (
              <Menu size={21} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Drawer */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[100] lg:hidden ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={open ? 0 : -1}
          onClick={closeMenu}
          className={`absolute inset-0 h-full w-full cursor-default bg-charcoal/50 backdrop-blur-[2px] transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Right-Side Glass Drawer */}
        <aside
          id="mobile-navigation"
          inert={!open ? "" : undefined}
          className={`absolute inset-y-0 right-0 flex h-[100dvh] w-[min(86vw,360px)] max-w-full flex-col overflow-hidden border-l border-white/60 bg-[#F8F5EF]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-charcoal/10 px-5 sm:h-20 sm:px-6">
            <Link
              to="/"
              aria-label={`${business.name} home`}
              onClick={closeMenu}
              tabIndex={open ? 0 : -1}
            >
              <img
                src={logo}
                alt={business.name}
                className="h-11 w-auto max-w-[140px] object-contain sm:h-12"
              />
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-white/70 text-charcoal transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              <X size={21} strokeWidth={1.7} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Mobile navigation"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6"
          >
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-wood">
              Explore {business.name}
            </p>

            <div className="flex flex-col">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMenu}
                  tabIndex={open ? 0 : -1}
                  className={({ isActive }) =>
                    `group flex items-center justify-between gap-3 border-b border-charcoal/[0.08] py-4 transition-colors ${
                      isActive
                        ? "font-medium text-charcoal"
                        : "text-charcoal/70 hover:text-charcoal"
                    }`
                  }
                >
                  <span className="font-serif text-xl tracking-tight">
                    {item.label}
                  </span>

                  <ArrowRight
                    size={17}
                    strokeWidth={1.6}
                    className="shrink-0 text-wood transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom Project CTA */}
          <div className="shrink-0 border-t border-charcoal/10 bg-[#F8F5EF] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
            <p className="mb-3 text-xs leading-5 text-charcoal/60">
              Have a space in mind? Let&apos;s bring it to life.
            </p>

            <Link
              to="/contact"
              onClick={closeMenu}
              tabIndex={open ? 0 : -1}
              className="flex min-h-12 items-center justify-between gap-3 bg-charcoal px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-wood focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              Discuss your project
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-charcoal/40">
              Craftsmanship for modern spaces
            </p>
          </div>
        </aside>
      </div>

      {/* Page Content */}
      <main id="main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-paper/75">
        <div className="wrap py-12 sm:py-14 lg:py-16">
          {/* Footer CTA */}
          <div className="mb-10 flex flex-col justify-between gap-6 border-b border-white/15 pb-10 md:mb-12 md:flex-row md:items-end md:pb-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.25em] text-wood">
                Have a project in mind?
              </p>

              <h2 className="mt-3 font-serif text-3xl leading-tight text-paper sm:text-4xl">
                Let&apos;s create something
                <span className="block text-wood">worth coming home to.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-paper/65">
                From custom furniture to commercial interiors, tell us what you
                have in mind.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex w-fit shrink-0 items-center gap-2 bg-paper px-5 py-3.5 text-sm font-medium text-charcoal transition-colors hover:bg-wood"
            >
              Discuss your project
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {/* Footer Columns */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 min-[420px]:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-8">
            {/* Brand */}
            <div className="min-w-0 min-[420px]:col-span-2 lg:col-span-1">
              <Link to="/" className="font-serif text-3xl text-paper">
                {business.name}
              </Link>

              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-wood">
                Craftsmanship for modern spaces
              </p>

              <p className="mt-4 max-w-xs text-sm leading-7 text-paper/65">
                {business.tagline} Based in {business.address}, serving
                residential and commercial projects.
              </p>

              
            </div>

            {/* Explore */}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-paper">Explore</h2>

              <ul className="mt-4 space-y-3 text-sm">
                {nav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="transition-colors hover:text-wood"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-paper">Our Services</h2>

              <ul className="mt-4 space-y-3 text-sm">
                {footerServices.map((service) => (
                  <li key={service}>
                    <Link
                      to="/services"
                      className="transition-colors hover:text-wood"
                    >
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact and Legal Links */}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-paper">Get in Touch</h2>

              <address className="mt-4 space-y-4 text-sm not-italic">
                {business.phone && (
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="flex min-w-0 items-start gap-3 transition-colors hover:text-wood"
                  >
                    <Phone
                      size={17}
                      className="mt-0.5 shrink-0 text-wood"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-words">
                      {business.phone}
                    </span>
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex min-w-0 items-start gap-3 transition-colors hover:text-wood"
                  >
                    <Mail
                      size={17}
                      className="mt-0.5 shrink-0 text-wood"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-all">{business.email}</span>
                  </a>
                )}

                {business.maps && (
                  <a
                    href={business.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-start gap-3 transition-colors hover:text-wood"
                  >
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-wood"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-words">
                      {business.address}
                    </span>
                  </a>
                )}

                {/* Instagram */}
                {business.instagram && (
                  <a
                    href={business.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${business.name} on Instagram`}
                    className="inline-flex items-center gap-2 text-sm transition-colors hover:text-wood"
                  >
                    <FaInstagram
                      className="text-wood"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>{instagramHandle}</span>
                  </a>
                )}
              </address>

              <div className="mt-6 border-t border-white/10 pt-4">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      to="/terms"
                      className="transition-colors hover:text-wood"
                    >
                      Terms &amp; Conditions
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/privacy"
                      className="transition-colors hover:text-wood"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/15">
          <div className="wrap flex justify-center py-5 text-center text-xs leading-6 text-paper/50">
            <p>
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
