import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  status: "Completed",
  location: "",
  year: "",
  description: "",
  featured: false,
  published: false,
  gallery: "[]",
};

const inputClass =
  "mt-2 w-full border border-[#D8D2C7] bg-white p-3 text-sm outline-none focus:border-[#8A765B]";

const labelClass = "block text-sm text-[#51483B]";

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    throw Object.assign(new Error("Your admin session has expired."), {
      authError: true,
    });
  }

  if (!response.ok) {
    throw new Error(
      result.error?.message ||
        result.message ||
        "The request could not be completed.",
    );
  }

  return result;
}

function StatusBadge({ children, published }) {
  return (
    <span
      className={`inline-flex px-3 py-2 text-xs ${
        published
          ? "bg-green-100 text-green-800"
          : "bg-[#EEE7DB] text-[#6E5A40]"
      }`}
    >
      {children}
    </span>
  );
}

export default function AdminProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyProject, setBusyProject] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleAuthError = useCallback(
    (err) => {
      if (err.authError) {
        navigate("/admin/login", { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects/admin/all", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await readResponse(response);
      setProjects(result.data || []);
    } catch (err) {
      if (handleAuthError(err)) return;

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure the server is running."
          : err.message || "Unable to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function openCreateForm() {
    setEditingProject(null);
    setForm({ ...emptyForm });
    setCoverFile(null);
    setGalleryFiles([]);
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(project) {
    setEditingProject(project);
    setForm({
      title: project.title || "",
      slug: project.slug || "",
      category: project.category || "",
      status: project.status || "Completed",
      location: project.location || "",
      year: project.year ?? "",
      description: project.description || "",
      featured: Boolean(project.featured),
      published: Boolean(project.published),
      gallery: JSON.stringify(project.gallery || [], null, 2),
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setFormError("");
    setNotice("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingProject(null);
    setForm({ ...emptyForm });
    setCoverFile(null);
    setGalleryFiles([]);
    setFormError("");
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function getGalleryItems() {
    try {
      const items = JSON.parse(form.gallery || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function removeGalleryImage(indexToRemove) {
    const galleryItems = getGalleryItems();
    const imageToRemove = galleryItems[indexToRemove];

    if (!imageToRemove) return;

    const confirmed = window.confirm(
      "Remove this image from the project gallery? The change will take effect when you save the project."
    );

    if (!confirmed) return;

    const updatedGallery = galleryItems.filter(
      (_, index) => index !== indexToRemove
    );

    setForm((current) => ({
      ...current,
      gallery: JSON.stringify(updatedGallery, null, 2),
    }));

    setNotice("Gallery change pending. Click Save changes to confirm it.");
    setFormError("");
  }

  async function handleSaveProject(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setNotice("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    // Explicitly send checkbox values because unchecked boxes are omitted
    // by the browser when constructing FormData.
    formData.set("featured", String(form.featured));
    formData.set("published", String(form.published));

    if (editingProject) {
      // Preserve the existing gallery unless the administrator changes it.
      formData.set("gallery", form.gallery);
    }

    try {
      const editing = Boolean(editingProject);
      const url = editing
        ? `/api/projects/admin/${editingProject._id}`
        : "/api/projects/admin";

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        credentials: "include",
        body: formData,
      });

      const result = await readResponse(response);

      setShowForm(false);
      setEditingProject(null);
      setForm({ ...emptyForm });
      setCoverFile(null);
      setGalleryFiles([]);
      setNotice(
        editing
          ? "Project updated successfully."
          : "Project created successfully.",
      );

      await loadProjects();
    } catch (err) {
      if (handleAuthError(err)) return;

      setFormError(
        err.message === "Failed to fetch"
          ? "The server could not be reached. Check the backend terminal."
          : err.message || "Unable to save this project.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateProject(project, changes) {
    setBusyProject(project._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/projects/admin/${project._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const result = await readResponse(response);
      const updatedProject = result.data;

      setProjects((current) =>
        current.map((item) =>
          item._id === updatedProject._id ? updatedProject : item,
        ),
      );

      setNotice(
        changes.published !== undefined
          ? updatedProject.published
            ? "Project published successfully."
            : "Project unpublished successfully."
          : updatedProject.featured
            ? "Project marked as featured."
            : "Project removed from featured projects.",
      );
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.message || "Unable to update project.");
    } finally {
      setBusyProject("");
    }
  }

  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Delete "${project.title}"?\n\nThis removes the project record and attempts to delete its Cloudinary images. This action cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyProject(project._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/projects/admin/${project._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      await readResponse(response);

      setProjects((current) =>
        current.filter((item) => item._id !== project._id),
      );
      setNotice(`"${project.title}" was deleted.`);
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err.message || "Unable to delete project.");
    } finally {
      setBusyProject("");
    }
  }

  const visibleProjects = projects.filter((project) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [project.title, project.category, project.location, project.slug]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && project.published) ||
      (statusFilter === "Draft" && !project.published) ||
      (statusFilter === "Featured" && project.featured) ||
      project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#F5F2EC] px-5 py-8 text-[#292923] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8A765B]">
              Glass n Wood
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Manage Projects
            </h1>
            <p className="mt-3 text-sm text-[#77756D]">
              Manage project details, imagery, publishing and featured work.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="border border-[#D8D2C7] px-4 py-3 text-sm transition hover:bg-[#292923] hover:text-white"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={loadProjects}
              disabled={loading || saving || Boolean(busyProject)}
              className="border border-[#D8D2C7] px-4 py-3 text-sm transition hover:bg-[#292923] hover:text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={showForm ? closeForm : openCreateForm}
              disabled={saving}
              className="bg-[#292923] px-5 py-3 text-sm text-white transition hover:bg-[#51483B] disabled:opacity-50"
            >
              {showForm ? "Close form" : "+ Add Project"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {showForm && (
          <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
            <div className="border-b border-[#DED8CC] p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                {editingProject ? "Edit project" : "New project"}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {editingProject ? editingProject.title : "Project details"}
              </h2>
              <p className="mt-2 text-sm text-[#77756D]">
                Required fields are marked with an asterisk.
              </p>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-6 p-5 sm:p-7">
              {formError && (
                <div
                  role="alert"
                  className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Project title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    required
                    maxLength={140}
                    className={inputClass}
                    placeholder="Luxury Living Room"
                  />
                </label>

                <label className={labelClass}>
                  URL slug
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={updateField}
                    maxLength={160}
                    className={inputClass}
                    placeholder="luxury-living-room"
                  />
                  <span className="mt-1 block text-xs text-[#77756D]">
                    Use lowercase letters, numbers and hyphens.
                  </span>
                </label>

                <label className={labelClass}>
                  Category *
                  <input
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                    maxLength={80}
                    className={inputClass}
                    placeholder="Residential"
                  />
                </label>

                <label className={labelClass}>
                  Project status *
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                    className={inputClass}
                  >
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    maxLength={160}
                    className={inputClass}
                    placeholder="Siwan, Bihar"
                  />
                </label>

                <label className={labelClass}>
                  Year
                  <input
                    name="year"
                    type="number"
                    value={form.year}
                    onChange={updateField}
                    min={2000}
                    max={2100}
                    className={inputClass}
                    placeholder="2026"
                  />
                </label>
              </div>

              <label className={labelClass}>
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  required
                  maxLength={5000}
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the design, materials, space and project requirements..."
                />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Cover image {editingProject ? "(optional)" : "*"}
                    <input
                      name="cover"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required={!editingProject}
                      onChange={(event) =>
                        setCoverFile(event.target.files?.[0] || null)
                      }
                      className="mt-3 block w-full text-sm"
                    />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-[#77756D]">
                    JPG, PNG or WebP. Maximum 8 MB.{" "}
                    {editingProject
                      ? "Leave empty to keep the existing cover."
                      : "A cover image is required."}
                  </p>

                  {coverFile && (
                    <p className="mt-2 break-all text-xs text-[#8A765B]">
                      Selected: {coverFile.name}
                    </p>
                  )}

                  {editingProject && (
                    <img
                      src={editingProject.cover}
                      alt="Current cover"
                      className="mt-4 h-32 w-full border border-[#DED8CC] object-cover"
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    {editingProject
                      ? "Add gallery images"
                      : "Gallery images (optional)"}
                    <input
                      name="galleryImages"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) =>
                        setGalleryFiles(Array.from(event.target.files || []))
                      }
                      className="mt-3 block w-full text-sm"
                    />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-[#77756D]">
                    Select up to 14 images, maximum 8 MB each. New gallery
                    images are added to the existing gallery when editing.
                  </p>

                  {galleryFiles.length > 0 && (
                    <p className="mt-2 text-xs text-[#8A765B]">
                      {galleryFiles.length} image
                      {galleryFiles.length === 1 ? "" : "s"} selected
                    </p>
                  )}

                  {editingProject && (
                    <p className="mt-2 text-xs text-[#77756D]">
                      Current gallery: {editingProject.gallery?.length || 0}{" "}
                      image(s)
                    </p>
                  )}
                </div>
              </div>

              {editingProject && (
                <div className="border border-[#DED8CC] bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-[#292923]">
                        Manage gallery images
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#77756D]">
                        Remove individual images below, then click Save changes.
                        Images are removed from storage only after the project saves successfully.
                      </p>
                    </div>
                    <span className="border border-[#DED8CC] px-3 py-2 text-xs text-[#77756D]">
                      {getGalleryItems().length} image(s)
                    </span>
                  </div>

                  {getGalleryItems().length === 0 ? (
                    <p className="mt-4 border border-dashed border-[#DED8CC] p-6 text-center text-sm text-[#77756D]">
                      No gallery images. Upload new images above to add some.
                    </p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {getGalleryItems().map((image, index) => (
                        <article
                          key={`${image.publicId || image.src || "gallery-image"}-${index}`}
                          className="overflow-hidden border border-[#DED8CC] bg-[#FBF9F5]"
                        >
                          <img
                            src={image.src}
                            alt={image.alt || `Gallery image ${index + 1}`}
                            loading="lazy"
                            className="h-32 w-full bg-[#EEE7DB] object-cover sm:h-40"
                          />
                          <div className="p-3">
                            <p className="truncate text-xs text-[#77756D]" title={image.alt || ""}>
                              {image.alt || `Gallery image ${index + 1}`}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              disabled={saving}
                              className="mt-3 w-full border border-red-200 px-3 py-2 text-xs text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove image
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editingProject && (
                <details className="border border-[#DED8CC] p-4">
                  <summary className="cursor-pointer text-sm">
                    Advanced: edit gallery image URLs and alt text
                  </summary>
                  <label className={`mt-4 ${labelClass}`}>
                    Gallery JSON
                    <textarea
                      name="gallery"
                      value={form.gallery}
                      onChange={updateField}
                      rows={7}
                      spellCheck={false}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </label>
                  <p className="mt-2 text-xs leading-5 text-[#77756D]">
                    Keep the format as a JSON array of objects with "src" and
                    "alt" fields. Save only valid image URLs and descriptions.
                    Editing this list replaces the existing gallery before any
                    newly uploaded images are appended.
                  </p>
                </details>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 border border-[#DED8CC] p-4 text-sm">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={updateField}
                    className="mt-1 h-4 w-4 accent-[#8A765B]"
                  />
                  <span>
                    <span className="block font-medium">Featured project</span>
                    <span className="mt-1 block text-xs text-[#77756D]">
                      Mark this project as featured on the website.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 border border-[#DED8CC] p-4 text-sm">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={updateField}
                    className="mt-1 h-4 w-4 accent-[#8A765B]"
                  />
                  <span>
                    <span className="block font-medium">Publish project</span>
                    <span className="mt-1 block text-xs text-[#77756D]">
                      Make this project available on the public website.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#DED8CC] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#292923] px-6 py-3 text-sm text-white transition hover:bg-[#51483B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Uploading and saving..."
                    : editingProject
                      ? "Save changes"
                      : "Create project"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="border border-[#D8D2C7] px-6 py-3 text-sm transition hover:bg-[#EEE7DB] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
          <div className="border-b border-[#DED8CC] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Content library
                </p>
                <h2 className="mt-2 font-serif text-2xl">All projects</h2>
              </div>

              <p className="text-sm text-[#77756D]">
                {visibleProjects.length} of {projects.length} projects
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, category, location..."
                aria-label="Search projects"
                className="w-full border border-[#D8D2C7] bg-white p-3 text-sm"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter projects"
                className="w-full border border-[#D8D2C7] bg-white p-3 text-sm"
              >
                <option value="All">All statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Drafts</option>
                <option value="Featured">Featured</option>
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-[#77756D]">
              Loading projects from MongoDB...
            </p>
          ) : projects.length === 0 ? (
            <div className="p-8">
              <p className="text-sm text-[#77756D]">No projects found.</p>
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 border border-[#D8D2C7] px-4 py-2 text-sm hover:bg-[#EEE7DB]"
              >
                Create your first project
              </button>
            </div>
          ) : visibleProjects.length === 0 ? (
            <p className="p-8 text-sm text-[#77756D]">
              No projects match your search or filter.
            </p>
          ) : (
            <div className="divide-y divide-[#E8E2D8]">
              {visibleProjects.map((project) => {
                const isBusy = busyProject === project._id;

                return (
                  <article
                    key={project._id}
                    className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center"
                  >
                    <img
                      src={project.cover}
                      alt={project.title}
                      loading="lazy"
                      className="h-40 w-full shrink-0 border border-[#DED8CC] bg-[#EEE7DB] object-cover sm:h-32 lg:w-44"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-serif text-xl">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#77756D]">
                        {project.category} · {project.status}
                        {project.location ? ` · ${project.location}` : ""}
                        {project.year ? ` · ${project.year}` : ""}
                      </p>

                      <p className="mt-2 break-all text-xs text-[#8A765B]">
                        /projects/{project.slug}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge published={project.published}>
                          {project.published ? "Published" : "Draft"}
                        </StatusBadge>

                        {project.featured && (
                          <span className="bg-[#292923] px-3 py-2 text-xs text-white">
                            Featured
                          </span>
                        )}

                        <span className="border border-[#DED8CC] px-3 py-2 text-xs text-[#77756D]">
                          {project.gallery?.length || 0} gallery image(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-64 lg:justify-end">
                      <button
                        type="button"
                        disabled={Boolean(busyProject) || saving}
                        onClick={() => openEditForm(project)}
                        className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#EEE7DB] disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyProject) || saving}
                        onClick={() =>
                          updateProject(project, {
                            published: !project.published,
                          })
                        }
                        className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white disabled:opacity-50"
                      >
                        {isBusy
                          ? "Saving..."
                          : project.published
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyProject) || saving}
                        onClick={() =>
                          updateProject(project, {
                            featured: !project.featured,
                          })
                        }
                        className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white disabled:opacity-50"
                      >
                        {project.featured ? "Unfeature" : "Feature"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyProject) || saving}
                        onClick={() => deleteProject(project)}
                        className="border border-red-200 px-3 py-2 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {isBusy ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-6 text-xs leading-5 text-[#8B877F]">
          Project records are stored in MongoDB. Uploaded images are sent to
          Cloudinary. Only published projects are available through the public
          project API.
        </p>
      </div>
    </main>
  );
}
