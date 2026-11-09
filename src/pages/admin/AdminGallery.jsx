import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Upload,
  Trash2,
  X,
  Images,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "/api/gallery";
const MAX_FILES = 15;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function AdminGallery() {
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch uploaded gallery images
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/all`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load gallery images.");
      }

      setUploadedImages(data.images || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Select images and create previews
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    setError("");
    setMessage("");

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 8 MB limit.`);
        return false;
      }

      return true;
    });

    const remainingSlots = MAX_FILES - selectedFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      setError(`You can select a maximum of ${MAX_FILES} images per upload.`);
    }

    const newFiles = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles((previous) => [...previous, ...newFiles]);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // Remove selected image before upload
  const removeSelectedImage = (id) => {
    setSelectedFiles((previous) => {
      const image = previous.find((item) => item.id === id);

      if (image) URL.revokeObjectURL(image.preview);

      return previous.filter((item) => item.id !== id);
    });
  };

  // Upload selected images
  const handleUpload = async () => {
    if (!selectedFiles.length || uploading) return;

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      selectedFiles.forEach(({ file }) => {
        formData.append("images", file);
      });

      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      selectedFiles.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });

      setSelectedFiles([]);
      setMessage(data.message || "Images uploaded successfully.");

      await fetchImages();
    } catch (err) {
      setError(err.message || "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  };

  // Delete an uploaded image
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete image.");
      }

      setUploadedImages((previous) =>
        previous.filter((image) => image._id !== id),
      );

      setMessage("Image deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  // Release preview URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A8065]">
              Website Management
            </p>

            <h1 className="font-serif text-3xl text-[#30291F] sm:text-4xl">
              Gallery Management
            </h1>

            <p className="mt-2 text-sm text-[#81786D]">
              Upload and manage images displayed in your website gallery.
            </p>
          </div>

          <button
            onClick={fetchImages}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DED8CC] bg-white px-4 py-3 text-sm font-medium text-[#554A3D] transition hover:bg-[#F9F7F2] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh gallery
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={18} />
            {message}
            <button
              onClick={() => setMessage("")}
              className="ml-auto"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Upload Section */}
        <section className="rounded-2xl border border-[#E4DED3] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#F5F2EC] p-3 text-[#9A8065]">
              <ImagePlus size={22} />
            </div>

            <div>
              <h2 className="font-serif text-xl text-[#30291F]">
                Upload Images
              </h2>
              <p className="text-sm text-[#81786D]">
                Add images to your website gallery.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9D0C3] bg-[#FBF9F5] px-4 py-8 text-center transition hover:border-[#A88B6B] hover:bg-[#F8F5EF]"
          >
            <div className="mb-4 rounded-full bg-white p-4 text-[#9A8065] shadow-sm">
              <Upload size={25} />
            </div>

            <span className="font-medium text-[#40372D]">
              Click to select images
            </span>

            <span className="mt-2 text-xs text-[#92877A]">
              JPG, PNG or WEBP · Maximum 8 MB per image · Up to 15 images
            </span>
          </button>

          {/* Selected Image Previews */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-[#40372D]">
                  Selected images ({selectedFiles.length})
                </h3>

                <button
                  onClick={() => {
                    selectedFiles.forEach(({ preview }) =>
                      URL.revokeObjectURL(preview),
                    );
                    setSelectedFiles([]);
                  }}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {selectedFiles.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-[#E4DED3] bg-[#FBF9F5]"
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      onClick={() => removeSelectedImage(image.id)}
                      className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-600 shadow transition hover:bg-red-50"
                      aria-label="Remove selected image"
                    >
                      <X size={15} />
                    </button>

                    <p className="truncate px-2 py-2 text-xs text-[#6E6255]">
                      {image.file.name}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#80674D] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#665139] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={17} />
                      Upload {selectedFiles.length}{" "}
                      {selectedFiles.length === 1 ? "Image" : "Images"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Uploaded Images */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#30291F]">
                Uploaded Images
              </h2>
              <p className="mt-1 text-sm text-[#81786D]">
                Images available in your website gallery.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm text-[#80674D]">
              {uploadedImages.length} Images
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-[#E4DED3] bg-white">
              <Loader2 className="animate-spin text-[#9A8065]" size={28} />
            </div>
          ) : uploadedImages.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#E4DED3] bg-white px-5 text-center">
              <div className="mb-4 rounded-full bg-[#F5F2EC] p-5 text-[#9A8065]">
                <Images size={30} />
              </div>

              <h3 className="font-serif text-xl text-[#40372D]">
                No gallery images yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-[#81786D]">
                Select and upload your first images. They will appear here after
                uploading.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {uploadedImages.map((image) => (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-xl border border-[#E4DED3] bg-white shadow-sm"
                >
                  <img
                    src={image.src}
                    alt={image.alt || "Gallery image"}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <button
                    onClick={() => handleDelete(image._id)}
                    disabled={deletingId === image._id}
                    className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
                    aria-label="Delete gallery image"
                    title="Delete image"
                  >
                    {deletingId === image._id ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                    <p className="truncate text-xs text-white">
                      {image.alt || "Gallery image"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
