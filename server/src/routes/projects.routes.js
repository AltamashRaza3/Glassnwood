
import { Router } from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadProjectImages, {
  uploadBufferToCloudinary,
} from "../middleware/uploadProjectImages.js";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const databaseRequired = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Projects are temporarily unavailable.",
      },
    });
  }

  next();
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);

const isValidHttpUrl = (value) => {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

const parseGallery = (value) => {
  if (value === undefined) return undefined;

  const gallery = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(gallery)) {
    throw Object.assign(new Error("Gallery must be an array."), {
      status: 400,
    });
  }

  return gallery;
};

// Delete one Cloudinary image using its stored public ID.
async function destroyCloudinaryImage(publicId) {
  if (!publicId) return;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result?.result === "error") {
    throw new Error(`Cloudinary could not delete asset "${publicId}".`);
  }
}

// Best-effort cleanup. A Cloudinary cleanup failure must not undo a
// successful MongoDB save or deletion.
async function removeCloudinaryImages(publicIds) {
  const uniqueIds = [...new Set(publicIds.filter(Boolean))];

  const results = await Promise.allSettled(
    uniqueIds.map((id) => destroyCloudinaryImage(id))
  );

  const failures = results.filter(
    (result) => result.status === "rejected"
  );

  if (failures.length) {
    console.error(
      `[cloudinary] Failed to delete ${failures.length} image asset(s).`
    );
  }
}

// Upload images and clean up any successfully uploaded files if a later
// upload in the same batch fails.
const uploadImages = async (files) => {
  const uploaded = [];

  try {
    for (const file of files) {
      const result = await uploadBufferToCloudinary(file);

      uploaded.push({
        src: result.secure_url,
        publicId: result.public_id,
      });
    }

    return uploaded;
  } catch (error) {
    await removeCloudinaryImages(
      uploaded.map((image) => image.publicId)
    );

    throw error;
  }
};

// Backward compatibility for older Cloudinary URLs that don't have a
// saved publicId. Avoid guessing when URL transformations are ambiguous.
function getLegacyPublicId(url) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname !== "res.cloudinary.com" ||
      !parsed.pathname.includes("/image/upload/")
    ) {
      return null;
    }

    const uploadPath = parsed.pathname.split("/image/upload/")[1];
    const segments = uploadPath.split("/");

    if (/^v\d+$/.test(segments[0])) {
      segments.shift();
    } else if (
      segments.some((segment) =>
        /^(?:c_|w_|h_|q_|f_|fl_|g_|ar_|e_|t_)/.test(segment)
      )
    ) {
      return null;
    }

    return segments.join("/").replace(/\.[a-zA-Z0-9]+$/, "") || null;
  } catch {
    return null;
  }
}

function getImagePublicId(image) {
  return image?.publicId || getLegacyPublicId(image?.src);
}

function getProjectImageIds(project) {
  return [
    getImagePublicId({
      src: project.cover,
      publicId: project.coverPublicId,
    }),
    ...(project.gallery || []).map((image) =>
      getImagePublicId(image)
    ),
  ].filter(Boolean);
}

// ------------------------------------------------------
// PUBLIC: Get published projects
// GET /api/projects
// ------------------------------------------------------

router.get(
  "/",
  databaseRequired,
  asyncHandler(async (req, res) => {
    const filter = { published: true };

    if (req.query.category) {
      filter.category = String(req.query.category).slice(0, 80);
    }

    if (["Completed", "Ongoing"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const projects = await Project.find(filter)
      .select("-__v")
      .sort({ featured: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );

    res.json({ data: projects });
  })
);

// ------------------------------------------------------
// PUBLIC: Get one published project by slug
// GET /api/projects/:slug
// ------------------------------------------------------

router.get(
  "/:slug",
  databaseRequired,
  asyncHandler(async (req, res) => {
    const project = await Project.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();

    if (!project) {
      return res.status(404).json({
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found.",
        },
      });
    }

    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );

    res.json({ data: project });
  })
);

// ------------------------------------------------------
// ADMIN: Get all projects, including drafts
// GET /api/projects/admin/all
// ------------------------------------------------------

router.get(
  "/admin/all",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    const projects = await Project.find()
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    res.set("Cache-Control", "no-store");
    res.json({ data: projects });
  })
);

// ------------------------------------------------------
// ADMIN: Create project
// POST /api/projects/admin
// Content-Type: multipart/form-data
// ------------------------------------------------------

router.post(
  "/admin",
  requireAdmin,
  databaseRequired,
  uploadProjectImages.fields([
    { name: "cover", maxCount: 1 },
    { name: "galleryImages", maxCount: 14 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      category,
      status,
      location,
      year,
      description,
      featured,
      published,
    } = req.body;

    if (!title?.trim() || !category?.trim() || !description?.trim()) {
      return res.status(400).json({
        error: {
          message: "Title, category, and description are required.",
        },
      });
    }

    const coverFile = req.files?.cover?.[0];

    if (!coverFile) {
      return res.status(400).json({
        error: { message: "A cover image is required." },
      });
    }

    if (status && !["Completed", "Ongoing"].includes(status)) {
      return res.status(400).json({
        error: { message: "Status must be Completed or Ongoing." },
      });
    }

    const projectSlug = slugify(slug || title);

    if (!projectSlug) {
      return res.status(400).json({
        error: {
          message: "Please provide a valid project title or slug.",
        },
      });
    }

    const parsedFeatured = parseBoolean(featured);
    const parsedPublished = parseBoolean(published);

    if (parsedFeatured === null || parsedPublished === null) {
      return res.status(400).json({
        error: {
          message: "Featured and published must be true or false.",
        },
      });
    }

    let gallery;

    try {
      gallery = parseGallery(req.body.gallery);
    } catch {
      return res.status(400).json({
        error: { message: "Gallery must contain valid JSON." },
      });
    }

    if (
      gallery &&
      !gallery.every(
        (item) =>
          item &&
          isValidHttpUrl(item.src) &&
          typeof item.alt === "string" &&
          item.alt.trim()
      )
    ) {
      return res.status(400).json({
        error: {
          message: "Each gallery image needs a valid URL and alt text.",
        },
      });
    }

    const uploaded = await uploadImages([
      coverFile,
      ...(req.files?.galleryImages || []),
    ]);

    const cover = uploaded[0].src;
    const coverPublicId = uploaded[0].publicId;

    const galleryItems = [
      ...(gallery || []).map((item) => ({
        src: item.src,
        alt: item.alt.trim(),
        ...(item.publicId ? { publicId: item.publicId } : {}),
      })),
      ...uploaded.slice(1).map((image, index) => ({
        src: image.src,
        publicId: image.publicId,
        alt: req.files.galleryImages[index].originalname.slice(0, 300),
      })),
    ];

    try {
      const project = await Project.create({
        title,
        slug: projectSlug,
        category,
        status: status || "Completed",
        location: location || "",
        ...(year !== undefined && year !== ""
          ? { year: Number(year) }
          : {}),
        description,
        cover,
        coverPublicId,
        gallery: galleryItems,
        featured: parsedFeatured,
        published: parsedPublished,
      });

      return res.status(201).json({ data: project });
    } catch (error) {
      await removeCloudinaryImages(
        uploaded.map((image) => image.publicId)
      );

      if (error.code === 11000) {
        return res.status(409).json({
          error: { message: "A project with this slug already exists." },
        });
      }

      throw error;
    }
  })
);

// ------------------------------------------------------
// ADMIN: Update project, replace cover, add/remove gallery
// PATCH /api/projects/admin/:id
// Content-Type: multipart/form-data
// ------------------------------------------------------

router.patch(
  "/admin/:id",
  requireAdmin,
  databaseRequired,
  uploadProjectImages.fields([
    { name: "cover", maxCount: 1 },
    { name: "galleryImages", maxCount: 14 },
  ]),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { message: "Invalid project ID." },
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        error: { message: "Project not found." },
      });
    }

    // Capture current image IDs before changing the document.
    const previousImageIds = getProjectImageIds(project);

    const allowedFields = [
      "title",
      "category",
      "status",
      "location",
      "description",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    }

    if (req.body.slug !== undefined) {
      project.slug = slugify(req.body.slug);
    } else if (req.body.title !== undefined) {
      project.slug = slugify(req.body.title);
    }

    if (req.body.year !== undefined) {
      if (req.body.year === "") {
        project.year = undefined;
      } else {
        project.year = Number(req.body.year);
      }
    }

    for (const field of ["featured", "published"]) {
      if (req.body[field] !== undefined) {
        const value = parseBoolean(req.body[field]);

        if (value === null) {
          return res.status(400).json({
            error: { message: `${field} must be true or false.` },
          });
        }

        project[field] = value;
      }
    }

    // When supplied, gallery is the complete list to retain.
    // Newly uploaded gallery files are appended after this list.
    if (req.body.gallery !== undefined) {
      let gallery;

      try {
        gallery = parseGallery(req.body.gallery);
      } catch {
        return res.status(400).json({
          error: { message: "Gallery must contain valid JSON." },
        });
      }

      const validGallery = gallery.every(
        (item) =>
          item &&
          isValidHttpUrl(item.src) &&
          typeof item.alt === "string" &&
          item.alt.trim() &&
          (item.publicId === undefined ||
            (typeof item.publicId === "string" && item.publicId.trim()))
      );

      if (!validGallery) {
        return res.status(400).json({
          error: {
            message: "Each gallery item needs a valid URL and alt text.",
          },
        });
      }

      project.gallery = gallery.map((item) => ({
        src: item.src,
        alt: item.alt.trim(),
        ...(item.publicId ? { publicId: item.publicId } : {}),
      }));
    }

    const newFiles = [
      ...(req.files?.cover || []),
      ...(req.files?.galleryImages || []),
    ];

    let uploaded = [];

    try {
      uploaded = await uploadImages(newFiles);

      if (req.files?.cover?.[0]) {
        project.cover = uploaded[0].src;
        project.coverPublicId = uploaded[0].publicId;
      }

      if (req.files?.galleryImages?.length) {
        const start = req.files.cover?.length ? 1 : 0;

        const addedGallery = uploaded.slice(start).map((image, index) => ({
          src: image.src,
          publicId: image.publicId,
          alt: req.files.galleryImages[index].originalname.slice(0, 300),
        }));

        project.gallery.push(...addedGallery);
      }

      await project.save();
    } catch (error) {
      // Remove newly uploaded files if the database save fails.
      await removeCloudinaryImages(
        uploaded.map((image) => image.publicId)
      );

      if (error.code === 11000) {
        return res.status(409).json({
          error: { message: "A project with this slug already exists." },
        });
      }

      throw error;
    }

    // Delete only assets no longer referenced by the saved project.
    const retainedIds = new Set(getProjectImageIds(project));

    const removedIds = previousImageIds.filter(
      (id) => !retainedIds.has(id)
    );

    await removeCloudinaryImages(removedIds);

    res.set("Cache-Control", "no-store");
    return res.json({ data: project });
  })
);

// ------------------------------------------------------
// ADMIN: Delete project
// DELETE /api/projects/admin/:id
// ------------------------------------------------------

router.delete(
  "/admin/:id",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { message: "Invalid project ID." },
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        error: { message: "Project not found." },
      });
    }

    const imageIds = getProjectImageIds(project);

    await project.deleteOne();

    // The database deletion has succeeded; Cloudinary cleanup is best-effort.
    await removeCloudinaryImages(imageIds);

    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  })
);

export default router;
