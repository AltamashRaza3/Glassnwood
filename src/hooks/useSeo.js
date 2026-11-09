
import { useEffect } from "react";

const SITE_NAME = "Glass n Wood";

const DEFAULT_TITLE =
  "Glass n Wood | Glasswork, Woodwork & Interiors in Siwan, Bihar";

const DEFAULT_DESCRIPTION =
  "Glass n Wood offers premium glasswork, woodwork, and interior design solutions in Siwan, Bihar.";

const DEFAULT_IMAGE = "/og-image.jpg";

const setMeta = (attribute, key, content) => {
  if (!content) return;

  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

export default function useSeo(
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE
) {
  useEffect(() => {
    const pageTitle = title
      ? `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;

    const pageDescription = description || DEFAULT_DESCRIPTION;
    const pageImage = image || DEFAULT_IMAGE;

    document.title = pageTitle;

    // Standard SEO
    setMeta("name", "description", pageDescription);

    // Open Graph
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", pageDescription);
    setMeta("property", "og:image", pageImage);

    // Twitter / X
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", pageDescription);
    setMeta("name", "twitter:image", pageImage);

    return () => {
      // Prevent stale metadata when navigating between pages.
    };
  }, [title, description, image]);
}
