import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  Instagram,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const initialStats = {
  totalProjects: 0,
  publishedProjects: 0,
  featuredProjects: 0,
  completedProjects: 0,
  ongoingProjects: 0,
  totalEnquiries: 0,
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value, detail }) {
  return (
    <article className="border border-[#DED8CC] bg-[#FBF9F5] p-5 sm:p-6">
      <p className="text-sm text-[#77756D]">{label}</p>

      <p className="mt-4 font-serif text-4xl tabular-nums">
        {Number(value ?? 0).toLocaleString("en-IN")}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#8A765B]">{detail}</p>
    </article>
  );
}

function ManagementCard({ icon: Icon, title, description, link, linkLabel }) {
  return (
    <article className="flex flex-col border border-[#DED8CC] bg-[#FBF9F5] p-5 sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center bg-[#EEE8DC] text-[#6F5A40]">
        <Icon size={21} strokeWidth={1.7} />
      </div>

      <h3 className="mt-5 font-serif text-2xl">{title}</h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-[#77756D]">
        {description}
      </p>

      <Link
        to={link}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#514738] transition hover:text-black"
      >
        {linkLabel}
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const sessionResponse = await fetch("/api/admin/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (sessionResponse.status === 401 || sessionResponse.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.success) {
        throw new Error(
          sessionData.message || "Unable to verify your session.",
        );
      }

      setAdmin(sessionData.admin);

      const statsResponse = await fetch("/api/admin/stats", {
        credentials: "include",
        cache: "no-store",
      });

      if (statsResponse.status === 401 || statsResponse.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const statsData = await statsResponse.json();

      if (!statsResponse.ok || !statsData.success) {
        throw new Error(
          statsData.message || "Unable to load dashboard statistics.",
        );
      }

      setStats({
        ...initialStats,
        ...statsData.stats,
      });

      setRecentProjects(statsData.recentProjects || []);
      setRecentEnquiries(statsData.recentEnquiries || []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that your server is running and your API proxy is configured."
          : err.message || "Unable to load the dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  
async function updateEnquiry(id, updates) {
  try {
    const response = await fetch(`/api/enquiries/admin/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Failed to update enquiry.");
    }

    setRecentEnquiries((current) =>
      current.map((item) =>
        item._id === id ? { ...item, ...result.data } : item,
      ),
    );
  } catch (error) {
    window.alert(error.message || "Failed to update enquiry.");
  }
}

async function deleteEnquiry(id) {
  if (
    !window.confirm("Are you sure you want to permanently delete this enquiry?")
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/enquiries/admin/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete enquiry.");
    }

    setRecentEnquiries((current) => current.filter((item) => item._id !== id));

    setStats((current) => ({
      ...current,
      totalEnquiries: Math.max(0, current.totalEnquiries - 1),
    }));
  } catch (error) {
    window.alert(error.message || "Failed to delete enquiry.");
  }
}


  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Continue to the login screen if logout request fails.
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  if (loading && !admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EC] px-5 text-sm text-[#77756D]">
        Checking admin session and loading dashboard...
      </main>
    );
  }

  if (error && !admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F2EC] px-5 text-[#292923]">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl">Dashboard unavailable</h1>

          <p role="alert" className="mt-4 text-sm leading-6 text-red-700">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="mt-6 bg-[#292923] px-5 py-3 text-sm text-white transition hover:bg-[#514738] disabled:opacity-60"
          >
            {loading ? "Trying again..." : "Try again"}
          </button>

          <button
            onClick={() => navigate("/admin/login")}
            className="ml-3 mt-6 border border-[#D8D2C7] px-5 py-3 text-sm"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#292923]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DED8CC] bg-[#FBF9F5] px-5 py-5 sm:px-10">
        <Link to="/admin" className="block">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8A765B]">
            Glass n Wood
          </p>

          <p className="mt-1 text-sm text-[#77756D]">Management Portal</p>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden max-w-56 truncate text-sm text-[#77756D] sm:inline">
            {admin.email}
          </span>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 border border-[#D8D2C7] px-4 py-2 text-sm transition hover:bg-[#292923] hover:text-white disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-10">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8A765B]">
              Overview
            </p>

            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Dashboard</h1>

            <p className="mt-3 text-sm leading-6 text-[#77756D]">
              Welcome back. Manage your studio website, projects, and glass and
              mirror products from one place.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start border border-[#D8D2C7] px-4 py-3 text-sm transition hover:bg-[#292923] hover:text-white disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Website statistics */}
        <section
          aria-label="Website statistics"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            label="All projects"
            value={stats.totalProjects}
            detail="Total project records in the database"
          />

          <StatCard
            label="Published projects"
            value={stats.publishedProjects}
            detail="Projects visible on the public website"
          />

          <StatCard
            label="Featured projects"
            value={stats.featuredProjects}
            detail="Projects marked as featured"
          />

          <StatCard
            label="Completed projects"
            value={stats.completedProjects}
            detail="Project records marked completed"
          />

          <StatCard
            label="Ongoing projects"
            value={stats.ongoingProjects}
            detail="Project records marked ongoing"
          />

          <StatCard
            label="Total enquiries"
            value={stats.totalEnquiries}
            detail="Customer enquiries received"
          />
        </section>

        {/* Management shortcuts */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
              Workspace
            </p>

            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Manage your website
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#77756D]">
              Choose a section to update your website content.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ManagementCard
              icon={Boxes}
              title="Product Management"
              description="Add glass and mirror products, upload product photos, edit descriptions, and manage publication status."
              link="/admin/products"
              linkLabel="Manage products"
            />

            <ManagementCard
              icon={ClipboardList}
              title="Project Management"
              description="Manage your interior design projects, project details, galleries, categories, and featured work."
              link="/admin/projects"
              linkLabel="Manage projects"
            />

            <ManagementCard
              icon={ImageIcon}
              title="Website Gallery"
              description="Review your published visual portfolio and see how your project imagery is presented."
              link="/admin/gallery"
              linkLabel="View public gallery"
            />

            <ManagementCard
              icon={Instagram}
              title="Instagram Management"
              description="Add Instagram Reels and Posts, publish or unpublish content, change display order, and remove posts from your website."
              link="/admin/instagram"
              linkLabel="Manage Instagram posts"
            />
          </div>
        </section>

        {/* Product management callout */}
        <section className="mt-8 border border-[#DED8CC] bg-[#EDE6DA] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center bg-[#FBF9F5] text-[#6F5A40] sm:flex">
                <Sparkles size={23} strokeWidth={1.6} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Glass & Mirrors
                </p>

                <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                  Keep your catalogue up to date
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6D695F]">
                  Add new designs, update product imagery, and publish products
                  when they are ready for customers to view.
                </p>
              </div>
            </div>

            <Link
              to="/admin/products"
              className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#292923] px-6 py-3 text-sm text-white transition hover:bg-[#514738]"
            >
              Open product manager
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 border-t border-[#D8CDBB] pt-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Boxes size={19} className="mt-0.5 shrink-0 text-[#8A765B]" />
              <div>
                <p className="text-sm font-medium">Product details</p>
                <p className="mt-1 text-xs leading-5 text-[#77756D]">
                  Maintain names, categories, and descriptions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ImageIcon size={19} className="mt-0.5 shrink-0 text-[#8A765B]" />
              <div>
                <p className="text-sm font-medium">Image uploads</p>
                <p className="mt-1 text-xs leading-5 text-[#77756D]">
                  Manage product photos stored through Cloudinary.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-[#8A765B]"
              />
              <div>
                <p className="text-sm font-medium">Publishing control</p>
                <p className="mt-1 text-xs leading-5 text-[#77756D]">
                  Keep products as drafts or make them public.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent content */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Recent projects */}
          <div className="min-w-0 border border-[#DED8CC] bg-[#FBF9F5]">
            <div className="flex items-center justify-between gap-3 border-b border-[#DED8CC] p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Content
                </p>

                <h2 className="mt-2 font-serif text-2xl">Recent projects</h2>
              </div>

              <Link
                to="/admin/projects"
                aria-label="Manage projects"
                className="p-2 text-[#77756D] transition hover:bg-[#EEE8DC] hover:text-[#292923]"
              >
                <ArrowRight size={19} />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <p className="p-6 text-sm text-[#77756D]">
                No project records found.
              </p>
            ) : (
              <div className="divide-y divide-[#E8E2D8]">
                {recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex flex-wrap items-center justify-between gap-3 p-5"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">
                        {project.title}
                      </p>

                      <p className="mt-1 text-xs text-[#77756D]">
                        {project.category} · {project.status}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs ${
                          project.published
                            ? "text-green-800"
                            : "text-[#8A765B]"
                        }`}
                      >
                        {project.published ? "Published" : "Draft"}
                      </span>

                      <p className="mt-1 text-xs text-[#77756D]">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent enquiries */}
          <div className="min-w-0 border border-[#DED8CC] bg-[#FBF9F5]">
            <div className="flex items-center justify-between gap-3 border-b border-[#DED8CC] p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Client communication
                </p>

                <h2 className="mt-2 font-serif text-2xl">Recent enquiries</h2>

                <p className="mt-2 text-xs text-[#77756D]">
                  Latest {recentEnquiries.length} enquiries
                </p>
              </div>

              <ShieldCheck size={20} className="text-[#8A765B]" />
            </div>

            {recentEnquiries.length === 0 ? (
              <p className="p-6 text-sm text-[#77756D]">
                No enquiries received yet.
              </p>
            ) : (
              <div className="divide-y divide-[#E8E2D8]">
                {recentEnquiries.map((enquiry) => {
                  const phoneDigits = (enquiry.phone || "").replace(/\D/g, "");

                  const whatsappNumber = phoneDigits.startsWith("00")
                    ? phoneDigits.slice(2)
                    : phoneDigits;

                  return (
                    <article
                      key={enquiry._id}
                      className={`p-5 ${
                        enquiry.isRead
                          ? ""
                          : "border-l-2 border-l-[#8A765B] bg-[#F5F0E7]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-sm font-semibold">
                              {enquiry.name}
                            </h3>

                            {!enquiry.isRead && (
                              <span className="bg-[#E9DDC9] px-2 py-1 text-[10px] uppercase tracking-wider text-[#6F5A40]">
                                Unread
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#77756D]">
                            {enquiry.type || "General enquiry"} ·{" "}
                            {formatDate(enquiry.createdAt)}
                          </p>
                        </div>

                        <span className="shrink-0 border border-[#DED8CC] px-2 py-1 text-xs capitalize text-[#6F5A40]">
                          {(enquiry.status || "new").replace("-", " ")}
                        </span>
                      </div>

                      {enquiry.message && (
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#55534D]">
                          {enquiry.message}
                        </p>
                      )}

                      {enquiry.email && (
                        <p className="mt-2 break-all text-xs text-[#77756D]">
                          {enquiry.email}
                        </p>
                      )}

                      {enquiry.phone && (
                        <p className="mt-1 text-xs text-[#77756D]">
                          {enquiry.phone}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {enquiry.phone && (
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white"
                          >
                            Call
                          </a>
                        )}

                        {whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white"
                          >
                            WhatsApp
                          </a>
                        )}

                        {enquiry.email && (
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white"
                          >
                            Email
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            updateEnquiry(enquiry._id, {
                              isRead: !enquiry.isRead,
                            })
                          }
                          className="border border-[#D8D2C7] px-3 py-2 text-xs transition hover:bg-[#292923] hover:text-white"
                        >
                          {enquiry.isRead ? "Mark unread" : "Mark read"}
                        </button>

                        <select
                          aria-label={`Status for ${enquiry.name}`}
                          value={enquiry.status || "new"}
                          onChange={(event) =>
                            updateEnquiry(enquiry._id, {
                              status: event.target.value,
                            })
                          }
                          className="min-w-0 border border-[#D8D2C7] bg-transparent px-2 py-2 text-xs"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="follow-up">Follow-up</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => deleteEnquiry(enquiry._id)}
                          className="border border-red-200 px-3 py-2 text-xs text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-[#DED8CC] pt-5">
          <p className="text-xs leading-5 text-[#8B877F]">
            Glass n Wood Management Portal ·
          </p>
        </footer>
      </main>
    </div>
  );
}
