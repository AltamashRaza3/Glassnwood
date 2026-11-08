
import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: (images) => images.length <= 15,
        message: "A product can have at most 15 images.",
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
