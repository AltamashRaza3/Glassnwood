
import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: "Glass n Wood gallery image",
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const GalleryImage =
  mongoose.models.GalleryImage ||
  mongoose.model("GalleryImage", galleryImageSchema);

export default GalleryImage;
