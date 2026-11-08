import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emptyForm = {
  url: "",
  isPublished: true,
  displayOrder: 0,
};

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

const inputClass =
  "mt-2 w-full border border-[#D8D2C7] bg-white p-3 text-sm outline-none focus:border-[#8A765B]";

const labelClass = "block text-sm text-[#51483B]";

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex px-3 py-2 text-xs ${
        published
          ? "bg-green-100 text-green-800"
          : "bg-[#EEE7DB] text-[#6E5A40]"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function getInstagramDetails(url) {
  try {
    const parsed = new URL(url.trim());

    if (
      !["instagram.com", "www.instagram.com", "m.instagram.com"].includes(
        parsed.hostname.toLowerCase(),
      )
    ) {
      return null;
    }

    const match = parsed.pathname.match(/^\/(reel|p)\/([A-Za-z0-9_-]+)\/?$/);

    if (!match) return null;

    const type = match[1] === "reel" ? "reel" : "post";
    const shortcode = match[2];

    return {
      type,
      shortcode,
      url: `https://www.instagram.com/${type}/${shortcode}/`,
      embedUrl: `https://www.instagram.com/${type}/${shortcode}/embed/`,
    };
  } catch {
    return null;
  }
}

function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function AdminInstagram() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyPost, setBusyPost] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showPreview, setShowPreview] = useState(true);

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

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/instagram/admin", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await readResponse(response);
      setPosts(result.data || []);
    } catch (err) {
      if (handleAuthError(err)) return;

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure the server is running."
          : err.message || "Unable to load Instagram posts.",
      );
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const previewDetails = useMemo(
    () => getInstagramDetails(form.url),
    [form.url],
  );

  const openCreateForm = () => {
    setEditingPost(null);
    setForm({ ...emptyForm, displayOrder: posts.length });
    setFormError("");
    setNotice("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (post) => {
    setEditingPost(post);
    setForm({
      url: post.url || "",
      isPublished: Boolean(post.isPublished),
      displayOrder: post.displayOrder ?? 0,
    });
    setFormError("");
    setNotice("");
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingPost(null);
    setForm({ ...emptyForm });
    setFormError("");
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : name === "displayOrder" ? value : value,
    }));
  };

  async function handleSavePost(event) {
    event.preventDefault();

    setSaving(true);
    setFormError("");
    setNotice("");
    setError("");

    const details = getInstagramDetails(form.url);

    if (!details) {
      setFormError("Enter a valid Instagram Reel or Post URL.");
      setSaving(false);
      return;
    }

    const displayOrder = Number(form.displayOrder);

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0 ||
      displayOrder > 10000
    ) {
      setFormError("Display order must be a non-negative integer.");
      setSaving(false);
      return;
    }

    try {
      const editing = Boolean(editingPost);

      const url = editing
        ? `/api/instagram/admin/${editingPost._id}`
        : "/api/instagram/admin";

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: details.url,
          isPublished: form.isPublished,
          displayOrder,
        }),
      });

      await readResponse(response);

      setShowForm(false);
      setEditingPost(null);
      setForm({ ...emptyForm });

      setNotice(
        editing
          ? "Instagram post updated successfully."
          : "Instagram post added successfully.",
      );

      await loadPosts();
    } catch (err) {
      if (handleAuthError(err)) return;

      setFormError(
        err.message === "Failed to fetch"
          ? "The server could not be reached."
          : err.message || "Unable to save Instagram post.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updatePost(post, changes) {
    setBusyPost(post._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/instagram/admin/${post._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });

      const result = await readResponse(response);

      setPosts((current) =>
        current.map((item) =>
          item._id === result.data._id ? result.data : item,
        ),
      );

      if (changes.isPublished !== undefined) {
        setNotice(
          result.data.isPublished
            ? "Instagram post published successfully."
            : "Instagram post unpublished successfully.",
        );
      } else {
        setNotice("Display order updated successfully.");
      }
    } catch (err) {
      if (handleAuthError(err)) return;

      setError(err.message || "Unable to update Instagram post.");
    } finally {
      setBusyPost("");
    }
  }

  async function deletePost(post) {
    const confirmed = window.confirm(
      `Delete this Instagram ${post.type}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyPost(post._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/instagram/admin/${post._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      await readResponse(response);

      setPosts((current) => current.filter((item) => item._id !== post._id));

      setNotice("Instagram post deleted successfully.");
    } catch (err) {
      if (handleAuthError(err)) return;

      setError(err.message || "Unable to delete Instagram post.");
    } finally {
      setBusyPost("");
    }
  }

  const visiblePosts = posts.filter((post) => {
    const term = search.trim().toLowerCase();

    const matchesSearch =
      !term ||
      [post.url, post.shortcode, post.type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Published" && post.isPublished) ||
      (statusFilter === "Draft" && !post.isPublished) ||
      post.type === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const publishedCount = posts.filter((post) => post.isPublished).length;

  const draftCount = posts.length - publishedCount;

  return (
    <main className="min-h-screen bg-[#F5F2EC] px-5 py-8 text-[#292923] sm:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8A765B]">
              Glass n Wood
            </p>

            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Instagram Gallery
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#77756D]">
              Manage your Instagram Reels and posts. Published content
              automatically appears in the website Instagram section.
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
              onClick={loadPosts}
              disabled={loading || saving || Boolean(busyPost)}
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
              {showForm ? "Close form" : "+ Add Instagram Post"}
            </button>
          </div>
        </header>

        {/* Notifications */}
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

        {/* Statistics */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-[#DED8CC] bg-[#FBF9F5] p-5">
            <p className="text-xs uppercase tracking-wider text-[#8A765B]">
              Total posts
            </p>
            <p className="mt-3 font-serif text-4xl">{posts.length}</p>
          </div>

          <div className="border border-[#DED8CC] bg-[#FBF9F5] p-5">
            <p className="text-xs uppercase tracking-wider text-[#8A765B]">
              Published
            </p>
            <p className="mt-3 font-serif text-4xl">{publishedCount}</p>
          </div>

          <div className="border border-[#DED8CC] bg-[#FBF9F5] p-5">
            <p className="text-xs uppercase tracking-wider text-[#8A765B]">
              Drafts
            </p>
            <p className="mt-3 font-serif text-4xl">{draftCount}</p>
          </div>
        </section>

        {/* Add/Edit Form */}
        {showForm && (
          <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
            <div className="border-b border-[#DED8CC] p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                {editingPost ? "Edit Instagram post" : "New Instagram post"}
              </p>

              <h2 className="mt-2 font-serif text-3xl">
                {editingPost ? "Update content" : "Add to your gallery"}
              </h2>

              <p className="mt-2 text-sm text-[#77756D]">
                Paste a public Instagram Reel or Post URL below.
              </p>
            </div>

            <form onSubmit={handleSavePost} className="space-y-6 p-5 sm:p-7">
              {formError && (
                <div
                  role="alert"
                  className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* URL */}
                <div>
                  <label className={labelClass}>
                    Instagram URL *
                    <input
                      type="url"
                      name="url"
                      value={form.url}
                      onChange={updateField}
                      required
                      maxLength={2048}
                      placeholder="https://www.instagram.com/reel/..."
                      className={inputClass}
                    />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-[#77756D]">
                    Supported formats: instagram.com/reel/SHORTCODE and
                    instagram.com/p/SHORTCODE.
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                      Display order
                      <input
                        type="number"
                        name="displayOrder"
                        value={form.displayOrder}
                        onChange={updateField}
                        min="0"
                        max="10000"
                        step="1"
                        className={inputClass}
                      />
                      <span className="mt-1 block text-xs text-[#77756D]">
                        Lower numbers appear first.
                      </span>
                    </label>

                    <div className="flex items-center">
                      <label className="flex cursor-pointer items-start gap-3 border border-[#DED8CC] p-4 text-sm">
                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={form.isPublished}
                          onChange={updateField}
                          className="mt-1 h-4 w-4 accent-[#8A765B]"
                        />
                        <span>
                          <span className="block font-medium">
                            Publish post
                          </span>
                          <span className="mt-1 block text-xs text-[#77756D]">
                            Display it on the public website.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {previewDetails && (
                    <div className="mt-5 border border-[#DED8CC] bg-white p-4">
                      <p className="text-xs uppercase tracking-wider text-[#8A765B]">
                        URL verified
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <InstagramIcon className="h-7 w-7 text-[#8A765B]" />

                        <div>
                          <p className="text-sm font-medium capitalize">
                            Instagram {previewDetails.type}
                          </p>
                          <p className="mt-1 break-all text-xs text-[#77756D]">
                            {previewDetails.shortcode}
                          </p>
                        </div>
                      </div>

                      <a
                        href={previewDetails.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-xs text-[#8A765B] underline underline-offset-4"
                      >
                        Open original Instagram post
                      </a>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="border border-[#DED8CC] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">Instagram preview</h3>

                    <button
                      type="button"
                      onClick={() => setShowPreview((value) => !value)}
                      className="text-xs text-[#8A765B] underline"
                    >
                      {showPreview ? "Hide preview" : "Show preview"}
                    </button>
                  </div>

                  {showPreview && previewDetails ? (
                    <iframe
                      key={previewDetails.embedUrl}
                      src={previewDetails.embedUrl}
                      title="Instagram post preview"
                      className="mt-4 min-h-[420px] w-full border-0"
                      loading="lazy"
                      allowTransparency="true"
                    />
                  ) : showPreview ? (
                    <div className="mt-4 flex min-h-[420px] flex-col items-center justify-center bg-[#F5F2EC] p-6 text-center">
                      <InstagramIcon className="h-12 w-12 text-[#8A765B]" />
                      <p className="mt-4 text-sm font-medium">
                        Preview will appear here
                      </p>
                      <p className="mt-2 text-xs text-[#77756D]">
                        Paste a valid Instagram URL to preview its embed.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 flex min-h-[150px] items-center justify-center bg-[#F5F2EC] text-sm text-[#77756D]">
                      Preview hidden
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#DED8CC] pt-5">
                <button
                  type="submit"
                  disabled={saving || !previewDetails}
                  className="bg-[#292923] px-6 py-3 text-sm text-white transition hover:bg-[#51483B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPost
                      ? "Save changes"
                      : "Add Instagram Post"}
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

        {/* Content Library */}
        <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
          <div className="border-b border-[#DED8CC] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Content library
                </p>

                <h2 className="mt-2 font-serif text-2xl">Instagram posts</h2>
              </div>

              <p className="text-sm text-[#77756D]">
                {visiblePosts.length} of {posts.length} posts
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search URL or shortcode..."
                aria-label="Search Instagram posts"
                className="w-full border border-[#D8D2C7] bg-white p-3 text-sm"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter Instagram posts"
                className="w-full border border-[#D8D2C7] bg-white p-3 text-sm"
              >
                <option value="All">All posts</option>
                <option value="Published">Published</option>
                <option value="Draft">Drafts</option>
                <option value="Reel">Reels</option>
                <option value="Post">Regular posts</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-[#77756D]">
              Loading Instagram posts from MongoDB...
            </p>
          ) : posts.length === 0 ? (
            <div className="p-8">
              <InstagramIcon className="h-10 w-10 text-[#8A765B]" />

              <p className="mt-4 text-sm text-[#77756D]">
                No Instagram posts have been added yet.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 border border-[#D8D2C7] px-4 py-2 text-sm hover:bg-[#EEE7DB]"
              >
                Add your first Instagram post
              </button>
            </div>
          ) : visiblePosts.length === 0 ? (
            <p className="p-8 text-sm text-[#77756D]">
              No posts match your search or filter.
            </p>
          ) : (
            <div className="divide-y divide-[#E8E2D8]">
              {visiblePosts.map((post) => {
                const isBusy = busyPost === post._id;

                return (
                  <article
                    key={post._id}
                    className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center"
                  >
                    <div className="flex h-32 w-full shrink-0 items-center justify-center border border-[#DED8CC] bg-[#EEE7DB] lg:w-32">
                      <InstagramIcon className="h-12 w-12 text-[#8A765B]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-xl capitalize">
                          Instagram {post.type}
                        </h3>

                        <StatusBadge published={post.isPublished} />
                      </div>

                      <p className="mt-2 break-all text-xs text-[#8A765B]">
                        {post.url}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="border border-[#DED8CC] px-3 py-2 text-xs text-[#77756D]">
                          Order: {post.displayOrder ?? 0}
                        </span>

                        <span className="border border-[#DED8CC] px-3 py-2 text-xs text-[#77756D]">
                          ID: {post.shortcode}
                        </span>
                      </div>

                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-[#8A765B] underline underline-offset-4"
                      >
                        View on Instagram
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-64 lg:justify-end">
                      <button
                        type="button"
                        disabled={Boolean(busyPost) || saving}
                        onClick={() => openEditForm(post)}
                        className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#EEE7DB] disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyPost) || saving}
                        onClick={() =>
                          updatePost(post, {
                            isPublished: !post.isPublished,
                          })
                        }
                        className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white disabled:opacity-50"
                      >
                        {isBusy
                          ? "Saving..."
                          : post.isPublished
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyPost) || saving}
                        onClick={() => deletePost(post)}
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
          Instagram records are stored in MongoDB. The website displays
          published posts using Instagram's official embed. Posts must be public
          and embedding must be permitted by Instagram.
        </p>
      </div>
    </main>
  );
}
