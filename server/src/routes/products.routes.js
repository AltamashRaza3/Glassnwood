
import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadProjectImages, {
  uploadBufferToCloudinary,
} from "../middleware/uploadProjectImages.js";
import cloudinary from "../config/cloudinary.js";

const router = Router();

const uploadProductImages = uploadProjectImages.fields([
  { name: "images", maxCount: 15 },
]);

function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

function makeSlug(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return fallback;
}

function parseImages(value) {
  if (value === undefined) return undefined;

  const images = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(images)) {
    throw new Error("Images must be a JSON array.");
  }

  return images.map((image) => ({
    src: image.src,
    alt: image.alt || "",
    publicId: image.publicId || "",
  }));
}

async function uploadImages(files = []) {
  const uploaded = [];

  try {
    for (const file of files) {
      const result = await uploadBufferToCloudinary(file);

      uploaded.push({
        src: result.secure_url,
        alt: "",
        publicId: result.public_id,
      });
    }

    return uploaded;
  } catch (error) {
    await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
    throw error;
  }
}

async function deleteCloudinaryImages(publicIds = []) {
  for (const publicId of [...new Set(publicIds.filter(Boolean))]) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error("Cloudinary image cleanup failed:", publicId, error.message);
    }
  }
}

function getProductImageIds(product) {
  return (product.images || [])
    .map((image) => image.publicId)
    .filter(Boolean);
}

function respondError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "A product with this slug already exists.",
    });
  }

  if (error instanceof SyntaxError || error.message?.includes("JSON")) {
    return res.status(400).json({ message: "Invalid JSON data." });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === "MulterError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.message?.includes("Only JPG")) {
    return res.status(400).json({ message: error.message });
  }

  console.error("Product route error:", error);
  return res.status(500).json({ message: "Unable to process the product request." });
}

// Public: list published products.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable." });
    }

    const filter = { published: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ data: products });
  })
);

// Public: get one published product by slug.
router.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ data: product });
  })
);

// Admin: list all products, including drafts.
router.get(
  "/admin/all",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const products = await Product.find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json({ data: products });
  })
);

// Admin: create a product.
router.post(
  "/admin",
  requireAdmin,
  uploadProductImages,
  asyncHandler(async (req, res) => {
    const uploaded = await uploadImages(req.files?.images || []);

    try {
      const name = String(req.body.name || "").trim();
      const category = String(req.body.category || "").trim();
      const description = String(req.body.description || "").trim();
      const slug = makeSlug(req.body.slug || name);

      if (!name || !category || !description || !slug) {
        await deleteCloudinaryImages(uploaded.map((image) => image.publicId));

        return res.status(400).json({
          message: "Name, category and description are required.",
        });
      }

      const product = await Product.create({
        name,
        slug,
        category,
        description,
        images: uploaded,
        featured: parseBoolean(req.body.featured),
        published: parseBoolean(req.body.published),
        sortOrder: Number(req.body.sortOrder) || 0,
      });

      return res.status(201).json({
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
      return respondError(res, error);
    }
  })
);

// Admin: update product details, retain/remove images, and append new uploads.
router.patch(
  "/admin/:id",
  requireAdmin,
  uploadProductImages,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const oldImageIds = getProductImageIds(product);
    let newImages = [];

    try {
      if (req.body.images !== undefined) {
        product.images = parseImages(req.body.images);
      }

      newImages = await uploadImages(req.files?.images || []);

      if (req.body.name !== undefined) {
        product.name = String(req.body.name).trim();
      }

      if (req.body.slug !== undefined || req.body.name !== undefined) {
        product.slug = makeSlug(req.body.slug || product.name);
      }

      if (req.body.category !== undefined) {
        product.category = String(req.body.category).trim();
      }

      if (req.body.description !== undefined) {
        product.description = String(req.body.description).trim();
      }

      if (req.body.featured !== undefined) {
        product.featured = parseBoolean(req.body.featured, product.featured);
      }

      if (req.body.published !== undefined) {
        product.published = parseBoolean(req.body.published, product.published);
      }

      if (req.body.sortOrder !== undefined) {
        product.sortOrder = Number(req.body.sortOrder);
      }

      product.images.push(...newImages);

      await product.save();

      const retainedIds = new Set(getProductImageIds(product));
      const removedIds = oldImageIds.filter((id) => !retainedIds.has(id));

      await deleteCloudinaryImages(removedIds);

      res.json({ message: "Product updated successfully.", data: product });
    } catch (error) {
      await deleteCloudinaryImages(newImages.map((image) => image.publicId));
      return respondError(res, error);
    }
  })
);

// Admin: delete a product and its Cloudinary images.
router.delete(
  "/admin/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const imageIds = getProductImageIds(product);

    await product.deleteOne();
    await deleteCloudinaryImages(imageIds);

    res.json({ message: "Product deleted successfully." });
  })
);

// Convert Multer/Cloudinary errors to JSON responses.
router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  return respondError(res, error);
});

export default router;
