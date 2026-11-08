
import mongoose from "mongoose";

const instagramPostSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    shortcode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["reel", "post"],
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

instagramPostSchema.index({
  isPublished: 1,
  displayOrder: 1,
  createdAt: -1,
});

instagramPostSchema.index(
  { shortcode: 1 },
  { unique: true }
);

export default mongoose.models.InstagramPost ||
  mongoose.model("InstagramPost", instagramPostSchema);
