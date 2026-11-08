import useSeo from "../hooks/useSeo.js";

const sections = [
  {
    title: "1. Services",
    text: "Glass n Wood provides glasswork, woodwork, custom furniture and interior-related services for residential and commercial spaces. The exact scope of each project will be discussed and agreed upon with the customer before work begins.",
  },
  {
    title: "2. Quotations and Pricing",
    text: "Project pricing depends on the agreed scope, measurements, materials, design, installation requirements and other relevant costs. Any quotation provided is subject to the conditions and validity period stated in that quotation. Additional work or changes may affect the final price.",
  },
  {
    title: "3. Measurements and Approvals",
    text: "Customers should review and approve relevant designs, measurements, material selections, finishes and specifications before production or installation. Changes requested after approval may affect costs and completion timelines.",
  },
  {
    title: "4. Payments",
    text: "Payment amounts, advance payments, milestones and due dates will be communicated and agreed upon for each project. Any applicable cancellation, refund or payment conditions will be shared with the customer before confirmation.",
  },
  {
    title: "5. Timelines and Installation",
    text: "Estimated completion and installation dates are provided based on the information available at the time. Delays may occur because of material availability, site readiness, changes requested by the customer or circumstances beyond our reasonable control.",
  },
  {
    title: "6. Customer Responsibilities",
    text: "Customers should provide accurate project information, ensure reasonable access to the site and arrange any permissions or site preparations agreed upon before installation. Site conditions that affect the work should be communicated in advance.",
  },
  {
    title: "7. Materials, Finishes and Workmanship",
    text: "Natural materials, glass, wood, laminates and other finishes may have variations in colour, grain, texture or appearance. We will discuss material specifications and relevant expectations before proceeding with the work.",
  },
  {
    title: "8. Cancellations and Changes",
    text: "Requests to cancel or modify a confirmed project should be communicated as soon as possible. Any applicable charges, refund eligibility or costs for materials and work already completed will be handled according to the terms agreed for that project and applicable law.",
  },
  {
    title: "9. Website Content and Images",
    text: "Website text, photographs, graphics and other content are provided for general information and may not represent the exact materials, finishes or outcome of every project. Reuse of website content without permission is not permitted where prohibited by applicable law.",
  },
  {
    title: "10. Liability",
    text: "Nothing in these terms excludes or limits any liability or consumer rights that cannot lawfully be excluded or limited. Any other responsibility relating to a project will be governed by the applicable agreement and relevant law.",
  },
  {
    title: "11. Privacy",
    text: "Information submitted through our website or contact channels is handled in accordance with our Privacy Policy.",
  },
  {
    title: "12. Updates and Contact",
    text: "These terms may be updated when necessary. The version published on this website applies to website use from its publication date, subject to applicable law and any separate agreement governing an existing project.",
  },
];

export default function Terms() {
  useSeo(
    "Terms & Conditions",
    "Read the Terms and Conditions for using the Glass n Wood website and enquiring about our glasswork, woodwork, furniture and interior services.",
  );

  return (
    <main className="wrap py-14 sm:py-20">
      <header className="max-w-3xl">
        <p className="eyebrow">Legal Information</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          Terms & Conditions
        </h1>
        <p className="mt-5 text-sm leading-7 text-charcoal/70 sm:text-base">
          These terms explain the general conditions for using the Glass n Wood
          website and enquiring about our services. Project-specific terms may
          be agreed separately in writing.
        </p>
      </header>

      <div className="mt-10 max-w-3xl border-t border-charcoal/15">
        {sections.map((section) => (
          <section
            key={section.title}
            className="border-b border-charcoal/15 py-6"
          >
            <h2 className="font-serif text-xl sm:text-2xl">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-charcoal/75 sm:text-base">
              {section.text}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-charcoal/60">
        Questions about these terms?{" "}
        <a
          href="mailto:glassnwood97@gmail.com"
          className="underline underline-offset-4 hover:text-wood"
        >
          Contact Glass n Wood
        </a>
        .
      </p>
    </main>
  );
}
