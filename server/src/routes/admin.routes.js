
import { Router } from "express";
import mongoose from "mongoose";
import requireAdmin from "../middleware/requireAdmin.js";
import Project from "../models/Project.js";
import Enquiry from "../models/Enquiry.js";

const router = Router();

// Check the authenticated admin session.
router.get("/me", requireAdmin, (req, res) => {
  return res.json({
    success: true,
    admin: {
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});

// Real dashboard statistics, available only to authenticated admins.
router.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is temporarily unavailable.",
      });
    }

    const [
      totalProjects,
      publishedProjects,
      featuredProjects,
      completedProjects,
      ongoingProjects,
      totalEnquiries,
      recentProjects,
      recentEnquiries,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ published: true }),
      Project.countDocuments({ featured: true, published: true }),
      Project.countDocuments({ status: "Completed" }),
      Project.countDocuments({ status: "Ongoing" }),
      Enquiry.countDocuments(),
      Project.find()
        .select("title slug category status published featured createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Enquiry.find()
        .select("name type createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      stats: {
        totalProjects,
        publishedProjects,
        featuredProjects,
        completedProjects,
        ongoingProjects,
        totalEnquiries,
      },
      recentProjects,
      recentEnquiries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
