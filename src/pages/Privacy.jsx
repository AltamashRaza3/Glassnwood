import useSeo from "../hooks/useSeo.js";

export default function Privacy() {
  const apiEnabled =
    import.meta.env.VITE_USE_API === "true" ||
    Boolean(import.meta.env.VITE_API_URL);

  useSeo(
    "Privacy Policy | Glass n Wood",
    "Learn how Glass n Wood handles enquiry information, contact details, and third-party services on our website.",
  );

  const lastUpdated = "19 October 2026";

  return (
    <div className="wrap max-w-4xl py-12 md:py-20">
      {/* Page Header */}
      <header className="max-w-3xl">
        <p className="eyebrow">Legal Information</p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal md:text-6xl">
          Privacy Policy
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-charcoal/70 md:text-lg">
          Your privacy matters to us. This policy explains how Glass n Wood may
          collect, use, and protect information when you visit our website or
          contact us about our services.
        </p>

        <p className="mt-4 text-sm text-charcoal/50">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Policy Content */}
      <div className="mt-10 space-y-8 border-t border-charcoal/10 pt-8 text-sm leading-7 text-charcoal/75 md:mt-14 md:space-y-10 md:text-base">
        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            1. About Glass n Wood
          </h2>

          <p className="mt-3">
            Glass n Wood provides glasswork, woodwork, custom furniture,
            interior solutions, and related services. This policy applies to
            information handled through our website and the contact methods
            linked from it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            2. Information We May Collect
          </h2>

          <p className="mt-3">
            Depending on how you interact with our website, information may
            include:
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Your name and phone number.</li>
            <li>Your email address, if you provide one.</li>
            <li>Your service or project preferences.</li>
            <li>The message or enquiry you submit.</li>
            <li>
              Basic technical information processed by your browser, hosting
              provider, or third-party services.
            </li>
          </ul>

          <p className="mt-3">
            Please avoid including sensitive personal information in general
            enquiries.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            3. How We Handle Enquiries
          </h2>

          <p className="mt-3">
            {apiEnabled
              ? "When the enquiry API is enabled, information submitted through the enquiry form may be transmitted to our server and stored in our database so that we can review, manage, and respond to your request. The server may apply input validation and rate limiting."
              : "When the enquiry API is disabled, the website does not send enquiry form submissions to its own enquiry API. Email and WhatsApp links may open your selected application with a prefilled message. Information you choose to send is then handled by the relevant service."}
          </p>

          <p className="mt-3">
            We use enquiry information to understand your requirements, contact
            you about your project, provide requested information, and follow up
            where appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            4. How We Use Information
          </h2>

          <p className="mt-3">Information may be used to:</p>

          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Respond to questions and service enquiries.</li>
            <li>Discuss project scope, quotations, and requirements.</li>
            <li>Communicate about services you have requested.</li>
            <li>Maintain website security and prevent misuse.</li>
            <li>Meet applicable legal obligations.</li>
          </ul>

          <p className="mt-3">
            We do not describe this website as collecting information for
            purposes that have not been implemented or disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            5. Cookies and Third-Party Services
          </h2>

          <p className="mt-3">
            The website may link to or use third-party services such as
            WhatsApp, Instagram, mapping services, analytics tools, or hosting
            providers. When you interact with those services, their own privacy
            policies and practices may apply.
          </p>

          <p className="mt-3">
            If Instagram content is embedded on the website, Instagram or its
            parent company, Meta, may process information when the embedded
            content loads. The exact information collected depends on the
            integration and your settings.
          </p>

          <p className="mt-3">
            Any cookies, analytics, advertising pixels, or other tracking
            technologies should be disclosed here if they are enabled. Do not
            assume that a service is active merely because it is mentioned in
            this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            6. Sharing and Disclosure
          </h2>

          <p className="mt-3">
            Information may be processed by service providers that support
            website hosting, database storage, communications, or website
            functionality, where those providers are used. Information may also
            be disclosed when required by applicable law or necessary to address
            security or misuse concerns.
          </p>

          <p className="mt-3">
            Before publishing this policy, confirm the actual providers used by
            the website and describe any relevant data sharing accurately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            7. Data Retention and Security
          </h2>

          <p className="mt-3">
            We should retain personal information only for as long as reasonably
            necessary for the purposes described in this policy or as required
            by applicable law. The actual retention period depends on how
            enquiries and records are managed.
          </p>

          <p className="mt-3">
            Reasonable technical and organizational safeguards should be used to
            protect stored information. However, no method of transmission or
            electronic storage can be guaranteed to be completely secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            8. Your Choices and Requests
          </h2>

          <p className="mt-3">
            You may contact us to ask about personal information you have
            submitted or to request correction or deletion where applicable. We
            may need to verify your identity and may retain certain information
            where legally required.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            9. External Links
          </h2>

          <p className="mt-3">
            Our website may link to third-party websites or applications. We are
            not responsible for the privacy practices or content of external
            services. Please review their policies before providing personal
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal md:text-2xl">
            10. Contact Us
          </h2>

          <p className="mt-3">
            If you have a question about this Privacy Policy or an enquiry you
            submitted, contact Glass n Wood:
          </p>

          <div className="mt-5 space-y-2 rounded-2xl border border-charcoal/10 bg-stone/30 p-5">
            <p>
              <span className="font-medium text-charcoal">Email: </span>
              <a
                href="mailto:glassnwood97@gmail.com"
                className="underline underline-offset-4 hover:text-wood"
              >
                glassnwood97@gmail.com
              </a>
            </p>

            <p>
              <span className="font-medium text-charcoal">Phone: </span>
              <a
                href="tel:+919162732242"
                className="underline underline-offset-4 hover:text-wood"
              >
                +91 91627 32242
              </a>
            </p>

            <p>
              <span className="font-medium text-charcoal">Address: </span>
              Laxmipur, Siwan, Bihar 841226, India
            </p>
          </div>
        </section>
      </div>

      {/* Review Notice */}
      <aside className="mt-12 rounded-2xl border border-ember/30 bg-ember/5 p-5 text-sm leading-6 text-charcoal/75">
        <p className="font-semibold text-charcoal">Before publishing</p>
        <p className="mt-2">
          Confirm your database retention practices, hosting and database
          providers, analytics or advertising integrations, and any cookies or
          embedded content actually enabled on the website. This template is not
          legal advice and should be reviewed for compliance with applicable
          Indian privacy requirements before public launch.
        </p>
      </aside>
    </div>
  );
}
