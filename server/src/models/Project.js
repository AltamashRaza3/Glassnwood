
import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    src: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    // Cloudinary identifier used for reliable asset deletion.
    // Optional to support existing gallery records.
    publicId: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    status: {
      type: String,
      enum: ['Completed', 'Ongoing'],
      default: 'Completed',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    year: {
      type: Number,
      min: 2000,
      max: 2100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    cover: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    // Optional for existing projects; populated for new Cloudinary uploads.
    coverPublicId: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    gallery: {
      type: [galleryItemSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

projectSchema.index({ published: 1, featured: -1, createdAt: -1 });
projectSchema.index({ category: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
