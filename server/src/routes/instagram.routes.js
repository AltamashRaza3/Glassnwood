
import { Router } from "express";
import mongoose from "mongoose";
import InstagramPost from "../models/InstagramPost.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

const databaseRequired = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Instagram posts are temporarily unavailable.",
      },
    });
  }

  next();
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// Accept only Instagram post and Reel URLs.
// Store a normalized URL and extract its shortcode.
function parseInstagramUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());

    const allowedHosts = [
      "instagram.com",
      "www.instagram.com",
      "m.instagram.com",
    ];

    if (
      parsed.protocol !== "https:" ||
      !allowedHosts.includes(parsed.hostname.toLowerCase())
    ) {
      return null;
    }

    const segments = parsed.pathname
      .split("/")
      .filter(Boolean);

    const typeIndex = segments.findIndex(
      (segment) => segment === "reel" || segment === "p"
    );

    if (typeIndex === -1) return null;

    const type = segments[typeIndex];
    const shortcode = segments[typeIndex + 1];

    if (
      !shortcode ||
      !/^[A-Za-z0-9_-]+$/.test(shortcode) ||
      segments.length !== typeIndex + 2
    ) {
      return null;
    }

    return {
      type: type === "reel" ? "reel" : "post",
      shortcode,
      url: `https://www.instagram.com/${type}/${shortcode}/`,
    };
  } catch {
    return null;
  }
}

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

const parseDisplayOrder = (value) => {
  const order = Number(value);

  if (
    !Number.isInteger(order) ||
    order < 0 ||
    order > 10000
  ) {
    return null;
  }

  return order;
};

// ------------------------------------------------------
// PUBLIC: Get published Instagram posts
// GET /api/instagram
// ------------------------------------------------------

router.get(
  "/",
  databaseRequired,
  asyncHandler(async (req, res) => {
    const posts = await InstagramPost.find({
      isPublished: true,
    })
      .select("url shortcode type displayOrder createdAt")
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(30)
      .lean();

    const data = posts.map((post) => ({
      ...post,
      embedUrl: `https://www.instagram.com/${post.type}/${post.shortcode}/embed/`,
    }));

    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );

    return res.json({ data });
  })
);

// ------------------------------------------------------
// ADMIN: Get all Instagram posts, including drafts
// GET /api/instagram/admin
// ------------------------------------------------------

router.get(
  "/admin",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    const posts = await InstagramPost.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.set("Cache-Control", "no-store");

    return res.json({ data: posts });
  })
);

// ------------------------------------------------------
// ADMIN: Add Instagram post or Reel
// POST /api/instagram/admin
// Body: { url, isPublished?, displayOrder? }
// ------------------------------------------------------

router.post(
  "/admin",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    const parsed = parseInstagramUrl(req.body.url);

    if (!parsed) {
      return res.status(400).json({
        error: {
          message:
            "Please enter a valid public Instagram post or Reel URL.",
        },
      });
    }

    const isPublished =
      req.body.isPublished === undefined
        ? true
        : parseBoolean(req.body.isPublished);

    if (isPublished === null) {
      return res.status(400).json({
        error: {
          message: "isPublished must be true or false.",
        },
      });
    }

    const displayOrder =
      req.body.displayOrder === undefined
        ? 0
        : parseDisplayOrder(req.body.displayOrder);

    if (displayOrder === null) {
      return res.status(400).json({
        error: {
          message: "displayOrder must be a non-negative integer.",
        },
      });
    }

    try {
      const post = await InstagramPost.create({
        ...parsed,
        isPublished,
        displayOrder,
      });

      res.set("Cache-Control", "no-store");

      return res.status(201).json({ data: post });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error: {
            message: "This Instagram post has already been added.",
          },
        });
      }

      throw error;
    }
  })
);

// ------------------------------------------------------
// ADMIN: Update Instagram post
// PATCH /api/instagram/admin/:id
// Body: { url?, isPublished?, displayOrder? }
// ------------------------------------------------------

router.patch(
  "/admin/:id",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { message: "Invalid Instagram post ID." },
      });
    }

    const post = await InstagramPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: { message: "Instagram post not found." },
      });
    }

    if (req.body.url !== undefined) {
      const parsed = parseInstagramUrl(req.body.url);

      if (!parsed) {
        return res.status(400).json({
          error: {
            message:
              "Please enter a valid public Instagram post or Reel URL.",
          },
        });
      }

      post.url = parsed.url;
      post.shortcode = parsed.shortcode;
      post.type = parsed.type;
    }

    if (req.body.isPublished !== undefined) {
      const value = parseBoolean(req.body.isPublished);

      if (value === null) {
        return res.status(400).json({
          error: {
            message: "isPublished must be true or false.",
          },
        });
      }

      post.isPublished = value;
    }

    if (req.body.displayOrder !== undefined) {
      const order = parseDisplayOrder(req.body.displayOrder);

      if (order === null) {
        return res.status(400).json({
          error: {
            message: "displayOrder must be a non-negative integer.",
          },
        });
      }

      post.displayOrder = order;
    }

    try {
      await post.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error: {
            message: "This Instagram post has already been added.",
          },
        });
      }

      throw error;
    }

    res.set("Cache-Control", "no-store");

    return res.json({ data: post });
  })
);

// ------------------------------------------------------
// ADMIN: Delete Instagram post
// DELETE /api/instagram/admin/:id
// ------------------------------------------------------

router.delete(
  "/admin/:id",
  requireAdmin,
  databaseRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: { message: "Invalid Instagram post ID." },
      });
    }

    const post = await InstagramPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: { message: "Instagram post not found." },
      });
    }

    await post.deleteOne();

    return res.json({
      success: true,
      message: "Instagram post deleted successfully.",
    });
  })
);

export default router;
