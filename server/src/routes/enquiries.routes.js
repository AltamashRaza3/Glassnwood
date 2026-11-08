
import { Router } from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many enquiries. Please try again later.",
    },
  },
});

const clean = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const allowedStatuses = [
  "new",
  "contacted",
  "follow-up",
  "converted",
  "closed",
];

// Submit an enquiry from the public website.
// POST /api/enquiries
router.post("/", enquiryLimiter, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: {
          code: "DATABASE_UNAVAILABLE",
          message:
            "The enquiry service is temporarily unavailable. Please contact us by WhatsApp or email.",
        },
      });
    }

    // Honeypot: return generic success without saving bot submissions.
    if (clean(req.body?.website, 200)) {
      return res.status(201).json({
        message: "Enquiry received.",
      });
    }

    const enquiry = {
      name: clean(req.body?.name, 100),
      phone: clean(req.body?.phone, 30),
      email: clean(req.body?.email, 254).toLowerCase(),
      type: clean(req.body?.type, 100),
      message: clean(req.body?.message, 3000),
      projectSlug: clean(req.body?.projectSlug, 160),
    };

    const phoneDigits = enquiry.phone.replace(/\D/g, "");

    if (
      enquiry.name.length < 2 ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15 ||
      !enquiry.type ||
      enquiry.message.length < 5
    ) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Please provide a valid name, phone number, service and message.",
        },
      });
    }

    if (
      enquiry.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)
    ) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid email address.",
        },
      });
    }

    const savedEnquiry = await Enquiry.create(enquiry);

    return res.status(201).json({
      message: "Thank you. Your enquiry has been received.",
      data: {
        id: savedEnquiry._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// List enquiries for the authenticated admin.
// GET /api/enquiries/admin
router.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Enquiries are temporarily unavailable.",
        },
      });
    }

    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
});

// Mark as read/unread or update the enquiry status.
// PATCH /api/enquiries/admin/:id
router.patch("/admin/:id", requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is temporarily unavailable.",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid enquiry ID.",
      });
    }

    const updates = {};

    if (typeof req.body?.isRead === "boolean") {
      updates.isRead = req.body.isRead;
    }

    if (req.body?.status !== undefined) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid enquiry status.",
          allowedStatuses,
        });
      }

      updates.status = req.body.status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a valid isRead or status update.",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      message: "Enquiry updated successfully.",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
});

// Permanently delete an enquiry.
// DELETE /api/enquiries/admin/:id
router.delete("/admin/:id", requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is temporarily unavailable.",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid enquiry ID.",
      });
    }

    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
