
import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: "",
    },

    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    projectSlug: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "follow-up", "converted", "closed"],
      default: "new",
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ isRead: 1, createdAt: -1 });
enquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Enquiry ||
  mongoose.model("Enquiry", enquirySchema);
