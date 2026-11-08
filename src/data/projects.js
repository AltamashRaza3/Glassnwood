
 // src/data/projects.js
import { siteImages } from "./siteImages.js";

// Project cover images are managed centrally in siteImages.js.
const projectImages = {
  "pnb-bank-interior": siteImages.featuredProjects.pnbBankInterior,
  "peter-england-interior": siteImages.featuredProjects.peterEnglandInterior,
  "saksham-hotel-interior": siteImages.featuredProjects.sakshamHotelInterior,
  "glass-partition-office": siteImages.featuredProjects.glassPartitionOffice,
  "solid-wood-dining-table": siteImages.featuredProjects.solidWoodDiningTable,
  "fitforage-gym": siteImages.featuredProjects.fitforageGym,
  "retail-showroom": siteImages.featuredProjects.retailShowroom,
  "custom-living-furniture": siteImages.featuredProjects.customLivingFurniture,
  "frameless-glass-doors": siteImages.featuredProjects.framelessGlassDoors,
};

// Project data:
// [title, slug, category, status, location, area, year]
const projectData = [
  [
    "PNB Bank Interior Work",
    "pnb-bank-interior",
    "Bank Interiors",
    "Completed",
    "Siwan, Bihar",
    1200,
    2025,
  ],
  [
    "Peter England Interior Work",
    "peter-england-interior",
    "Retail Showrooms",
    "Completed",
    "Siwan, Bihar",
    1500,
    2025,
  ],
  [
    "Saksham Hotel Interior",
    "saksham-hotel-interior",
    "Hotel Interiors",
    "Completed",
    "Siwan, Bihar",
    2500,
    2024,
  ],
  [
    "FitForage Gym",
    "fitforage-gym",
    "Gyms",
    "Ongoing",
    "Qutub Chhapra, Siswan Road, Siwan",
    200,
    null,
  ],
  [
    "Glass Partition Office",
    "glass-partition-office",
    "Corporate Offices",
    "Completed",
    "Siwan, Bihar",
    190,
    2024,
  ],
  [
    "Solid Wood Dining Table",
    "solid-wood-dining-table",
    "Dining Tables",
    "Completed",
    "Siwan, Bihar",
    25,
    2024,
  ],
  [
    "Retail Showroom Display",
    "retail-showroom",
    "Showrooms",
    "Completed",
    "Siwan, Bihar",
    30,
    2023,
  ],
  [
    "Custom Living Room Furniture",
    "custom-living-furniture",
    "Custom Furniture",
    "Ongoing",
    "Siwan, Bihar",
    20,
    null,
  ],
  [
    "Frameless Glass Doors",
    "frameless-glass-doors",
    "Glasswork",
    "Completed",
    "Siwan, Bihar",
    185,
    2025,
  ],
];

// Project descriptions
const projectDescriptions = {
  "pnb-bank-interior": {
    description:
      "Interior work for PNB Bank in Siwan, focused on creating a professional, organized and welcoming banking environment with practical use of space for staff and customers.",
  },

  "peter-england-interior": {
    description:
      "Interior work for the Peter England retail showroom in Siwan, with an emphasis on a polished shopping environment, organized product displays and a clean, contemporary retail experience.",
  },

  "saksham-hotel-interior": {
    description:
      "Interior work for Saksham Hotel in Siwan, focused on creating a welcoming hospitality environment with functional spaces, thoughtful finishes and a comfortable atmosphere for guests.",
  },

  "fitforage-gym": {
    description:
      "An ongoing gym project at Qutub Chhapra, Siswan Road, Siwan. The project focuses on making the most of the available space and creating a practical environment for workouts, movement and fitness activities.",
  },

  "glass-partition-office": {
    description:
      "A corporate office glass partition project in Siwan, designed to define work areas while maintaining visual openness and a professional atmosphere.",
  },

  "solid-wood-dining-table": {
    description:
      "A custom solid wood dining table project in Siwan, combining everyday functionality with the natural character of wood and a warm, timeless look.",
  },

  "retail-showroom": {
    description:
      "A retail showroom display project in Siwan, focused on organized product presentation and effective use of available space to improve the customer experience.",
  },

  "custom-living-furniture": {
    description:
      "An ongoing custom living room furniture project in Siwan, planned around the available space, everyday needs and interior style, balancing functionality and comfort.",
  },

  "frameless-glass-doors": {
    description:
      "A frameless glass door project in Siwan, bringing a clean, contemporary finish to the space while preserving visual openness.",
  },
};

// Export project records for use throughout the website.
export const projects = projectData.map(
  ([title, slug, category, status, location, area, year]) => {
    const cover = projectImages[slug];
    const projectDetails = projectDescriptions[slug];

    return {
      title,
      slug,
      category,
      status,
      location,
      area,
      year,
      sample: true,

      description:
        projectDetails?.description ??
        `Explore this ${category.toLowerCase()} project by Glass n Wood in ${location}.`,

      cover,

      // Temporary gallery until actual project photographs are added.
      gallery: cover
        ? [
            {
              src: cover,
              alt: `${title} — illustrative reference image`,
            },
          ]
        : [],
    };
  }
);
