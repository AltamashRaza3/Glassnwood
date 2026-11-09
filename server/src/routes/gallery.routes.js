
import express from "express";
import mongoose from "mongoose";

import GalleryImage from "../models/GalleryImage.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadProjectImages, {
  uploadBufferToCloudinary,
} from "../middleware/uploadProjectImages.js";

import cloudinary, {
  cloudinaryConfigured,
} from "../config/cloudinary.js";

const router = express.Router();

const GALLERY_FOLDER = "glass-n-wood/gallery";

// Public gallery: images displayed on the website
router.get("/", async (req, res, next) => {
  try {
    const images = await GalleryImage.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      images,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: fetch all uploaded gallery images
router.get("/admin/all", requireAdmin, async (req, res, next) => {
  try {
    const images = await GalleryImage.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      images,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: upload gallery images
router.post(
  "/",
  requireAdmin,
  uploadProjectImages.array("images", 15),
  async (req, res, next) => {
    const uploadedToCloudinary = [];

    try {
      if (!cloudinaryConfigured) {
        return res.status(503).json({
          success: false,
          message: "Cloudinary is not configured.",
        });
      }

      const files = req.files || [];

      if (!files.length) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one image.",
        });
      }

      for (const file of files) {
        const result = await uploadBufferToCloudinary(
          file,
          GALLERY_FOLDER
        );

        uploadedToCloudinary.push({
          src: result.secure_url,
          publicId: result.public_id,
        });
      }

      const savedImages = await GalleryImage.insertMany(
        uploadedToCloudinary.map((image) => ({
          src: image.src,
          publicId: image.publicId,
          alt: "Glass n Wood gallery image",
        }))
      );

      return res.status(201).json({
        success: true,
        message: `${savedImages.length} image(s) uploaded successfully.`,
        images: savedImages,
      });
    } catch (error) {
      // Clean up Cloudinary uploads if saving to MongoDB fails
      await Promise.allSettled(
        uploadedToCloudinary.map((image) =>
          cloudinary.uploader.destroy(image.publicId)
        )
      );

      next(error);
    }
  }
);

// Admin: delete a gallery image
router.delete(
  "/admin/:id",
  requireAdmin,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid gallery image ID.",
        });
      }

      const image = await GalleryImage.findById(req.params.id);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Gallery image not found.",
        });
      }

      if (cloudinaryConfigured && image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      await GalleryImage.findByIdAndDelete(image._id);

      return res.json({
        success: true,
        message: "Gallery image deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
