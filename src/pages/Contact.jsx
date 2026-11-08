import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  LoaderCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import useSeo from "../hooks/useSeo.js";
import { business } from "../data/site.js";

const MAX_MESSAGE_LENGTH = 2000;

const SERVICES = [
  "Glasswork",
  "Woodwork",
  "Custom furniture",
  "Dining table",
  "Gym",
  "Corporate office",
  "Showroom",
  "Salon interiors",
  "Commercial interiors",
  "Other",
];

const initialApiState = { status: "idle", message: "" };

function getFormData(form) {
  const values = Object.fromEntries(new FormData(form));

  return {
    name: String(values.name || "").trim(),
    email: String(values.email || "").trim(),
    phone: String(values.phone || "").trim(),
    type: String(values.type || "").trim(),
    message: String(values.message || "").trim(),
    website: String(values.website || "").trim(),
  };
}

function validateContactForm(form) {
  const data = getFormData(form);
  const fields = ["name", "email", "phone", "type", "message"];

  fields.forEach((name) => {
    form.elements.namedItem(name)?.setCustomValidity("");
  });

  const nameField = form.elements.namedItem("name");
  const emailField = form.elements.namedItem("email");
  const phoneField = form.elements.namedItem("phone");
  const typeField = form.elements.namedItem("type");
  const messageField = form.elements.namedItem("message");

  if (data.name.length < 2 || !/\p{L}/u.test(data.name)) {
    nameField.setCustomValidity(
      "Enter a valid name with at least 2 characters.",
    );
  } else if (data.name.length > 80) {
    nameField.setCustomValidity("Name cannot exceed 80 characters.");
  }

  if (data.email) {
    const emailPattern =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

    if (
      data.email.length > 254 ||
      !emailPattern.test(data.email) ||
      data.email.includes("..")
    ) {
      emailField.setCustomValidity(
        "Enter a valid email address, for example name@example.com.",
      );
    }
  }

  const phoneDigits = data.phone.replace(/\D/g, "");

  if (!/^\+?[\d\s().-]+$/.test(data.phone)) {
    phoneField.setCustomValidity(
      "Use digits, spaces, +, parentheses or hyphens only.",
    );
  } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    phoneField.setCustomValidity(
      "Enter a phone number containing 10–15 digits.",
    );
  } else if (/^(\d)\1+$/.test(phoneDigits)) {
    phoneField.setCustomValidity("Enter a valid phone number.");
  }

  if (!SERVICES.includes(data.type)) {
    typeField.setCustomValidity("Please select a service.");
  }

  if (data.message.length < 10) {
    messageField.setCustomValidity(
      "Please describe your project in at least 10 characters.",
    );
  } else if (data.message.length > MAX_MESSAGE_LENGTH) {
    messageField.setCustomValidity(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
    );
  }

  if (!form.reportValidity()) return null;

  // Honeypot spam check. Enforce this on the server as well.
  if (data.website) return null;

  return data;
}

function buildEnquiryMessage(data, projectRef) {
  return [
    "Hello Glass n Wood,",
    "",
    "I'd like to enquire about your services.",
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || "Not provided"}`,
    `Interested in: ${data.type}`,
    ...(projectRef ? [`Project reference: ${projectRef}`] : []),
    "",
    "Project details:",
    data.message,
    "",
    "Please contact me to discuss the next steps.",
  ].join("\n");
}

export default function Contact() {
  useSeo(
    "Contact | Glass n Wood",
    "Contact Glass n Wood for glasswork, woodwork, custom furniture, dining tables, gym interiors, showrooms and commercial spaces in Siwan, Bihar.",
  );

  const formRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [apiState, setApiState] = useState(initialApiState);

  const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const apiEnabled =
    import.meta.env.VITE_USE_API === "true" || Boolean(apiBase);

  const projectRef = (searchParams.get("project") || "").trim().slice(0, 150);
  const phone = business.phone || "";
  const email = business.email || "";
  const phoneDigits = (business.phoneRaw || "").replace(/\D/g, "");

  const handleApiSubmit = async () => {
    const form = formRef.current;

    if (!form || apiState.status === "sending") return;

    const data = validateContactForm(form);
    if (!data) return;

    setApiState({ status: "sending", message: "Sending your enquiry..." });

    try {
      const response = await fetch(`${apiBase}/api/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          type: data.type,
          message: data.message,
          projectSlug: projectRef,
          website: data.website,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "We couldn't submit your enquiry. Please try again.",
        );
      }

      form.reset();
      setApiState({
        status: "success",
        message:
          result?.message || "Thank you! Your enquiry has been received.",
      });
    } catch (error) {
      setApiState({
        status: "error",
        message:
          error instanceof TypeError
            ? "Unable to connect. Check your internet connection or contact us directly."
            : error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleExternalContact = (method) => {
    const form = formRef.current;
    if (!form) return;

    const data = validateContactForm(form);
    if (!data) return;

    const message = buildEnquiryMessage(data, projectRef);
    const subject = "Project Enquiry - Glass n Wood";

    if (method === "whatsapp") {
      if (!phoneDigits) {
        setApiState({
          status: "error",
          message: "The business WhatsApp number is not configured.",
        });
        return;
      }

      window.open(
        `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    if (method === "gmail") {
      const url = new URL("https://mail.google.com/mail/");
      url.searchParams.set("view", "cm");
      url.searchParams.set("fs", "1");
      url.searchParams.set("to", email);
      url.searchParams.set("su", subject);
      url.searchParams.set("body", message);

      window.open(url.toString(), "_blank", "noopener,noreferrer");
      return;
    }

    if (method === "email") {
      window.location.href =
        `mailto:${email}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(message)}`;
    }
  };

  const inputClass = "field mt-1.5 w-full text-sm font-normal";

  const labelClass = "block text-sm font-normal text-charcoal";

  const contactItemClass =
    "group flex items-start gap-3 text-sm font-normal text-charcoal/80 hover:text-cyan-dark";

  return (
    <div className="wrap py-10 md:py-14">
      {/* Page heading */}
      <header className="max-w-4xl">
        <p className="eyebrow">Contact</p>

        <h1 className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight text-charcoal sm:text-5xl md:text-6xl">
          Let's talk about
          <span className="text-wood"> your space.</span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-charcoal/70 sm:text-base sm:leading-8">
          Tell us about your project. We'll help you explore the right glass,
          woodwork, furniture or interior solution.
        </p>
      </header>

      <div className="mt-9 grid gap-9 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
        {/* Contact information */}
        <aside className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-charcoal">Get in touch</h2>
            <p className="mt-1.5 text-sm font-normal leading-6 text-charcoal/65">
              Contact us directly or send your project requirements through the
              form.
            </p>
          </div>

          <address className="not-italic">
            <div className="space-y-4">
              <a
                className={contactItemClass}
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              >
                <Phone size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-xs text-charcoal/50">Phone</span>
                  <span className="mt-1 block">{phone}</span>
                </span>
              </a>

              <a
                className={contactItemClass}
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-xs text-charcoal/50">
                    WhatsApp
                  </span>
                  <span className="mt-1 block">Chat with our team</span>
                </span>
              </a>

              <a className={contactItemClass} href={`mailto:${email}`}>
                <Mail size={18} className="mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs text-charcoal/50">Email</span>
                  <span className="mt-1 block break-all">{email}</span>
                </span>
              </a>

              <a
                className={contactItemClass}
                href={business.maps}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-xs text-charcoal/50">
                    Address
                  </span>
                  <span className="mt-1 block leading-6">
                    {business.address}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-charcoal/55">
                    Open Google Maps <ArrowUpRight size={12} />
                  </span>
                </span>
              </a>
            </div>
          </address>

          <div className="rounded-xl border border-charcoal/10 bg-stone/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <ShieldCheck size={17} />
              Your information matters
            </div>
            <p className="mt-2 text-sm font-normal leading-6 text-charcoal/65">
              Your details are used to respond to your enquiry. Read our{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-cyan-dark"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </aside>

        {/* Contact form */}
        <section className="rounded-xl border border-charcoal/10 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-medium text-charcoal">Project enquiry</h2>
          <p className="mt-1.5 text-sm font-normal text-charcoal/60">
            Fields marked with * are required.
          </p>

          <form
            ref={formRef}
            className="mt-6 space-y-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Phone number *
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="+91 98765 43210"
                className={inputClass}
                aria-describedby="phone-help"
              />
              <p
                id="phone-help"
                className="mt-1 text-xs font-normal text-charcoal/50"
              >
                Include your country code if applicable.
              </p>
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email <span className="text-charcoal/50">(optional)</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-type" className={labelClass}>
                Service required *
              </label>
              <select
                id="contact-type"
                name="type"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select a service
                </option>
                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Project details *
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={4}
                placeholder="Describe your requirements..."
                defaultValue={
                  projectRef
                    ? `I'm interested in a project similar to "${projectRef}".\n\nMy requirements: `
                    : ""
                }
                className={`${inputClass} resize-y`}
                aria-describedby="message-help"
              />
              <p
                id="message-help"
                className="mt-1 text-xs font-normal text-charcoal/50"
              >
                10–{MAX_MESSAGE_LENGTH} characters.
              </p>
            </div>

            {/* Honeypot spam field */}
            <div
              aria-hidden="true"
              className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="contact-website">Leave this field empty</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {apiEnabled && (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  className="btn w-full justify-center text-sm font-medium"
                  onClick={handleApiSubmit}
                  disabled={apiState.status === "sending"}
                >
                  {apiState.status === "sending" ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Sending enquiry...
                    </>
                  ) : (
                    "Submit enquiry"
                  )}
                </button>

                {apiState.message && (
                  <p
                    role={apiState.status === "error" ? "alert" : "status"}
                    aria-live="polite"
                    className={`flex items-start gap-2 text-sm font-normal leading-6 ${
                      apiState.status === "error"
                        ? "text-ember"
                        : apiState.status === "success"
                          ? "text-green-700"
                          : "text-charcoal/70"
                    }`}
                  >
                    {apiState.status === "success" && (
                      <CheckCircle2 size={16} className="mt-1 shrink-0" />
                    )}
                    <span>{apiState.message}</span>
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-charcoal/10 pt-4">
              <p className="text-sm font-normal text-charcoal/70">
                Prefer direct contact?
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="btn w-full justify-center bg-green-600 text-sm font-medium text-white hover:bg-green-700"
                  onClick={() => handleExternalContact("whatsapp")}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                  <ArrowUpRight size={14} />
                </button>

                <button
                  type="button"
                  className="btn w-full justify-center bg-black text-sm font-medium text-white hover:bg-charcoal"
                  onClick={() => handleExternalContact("gmail")}
                >
                  <Mail size={16} />
                  Open Gmail
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <button
                type="button"
                className="mt-3 text-sm font-normal text-charcoal/60 underline underline-offset-4 hover:text-cyan-dark"
                onClick={() => handleExternalContact("email")}
              >
                Open default email app instead
              </button>
            </div>

            <p className="text-xs font-normal leading-5 text-charcoal/50">
              {apiEnabled
                ? "Submitting sends your details to our enquiry service. Direct-contact options prepare a message for you to review and send."
                : "Direct-contact mode is active. Your enquiry is prepared in WhatsApp or email and is not submitted to this website's API."}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
