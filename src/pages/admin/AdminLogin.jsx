import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to sign in.");
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that the backend is running."
          : err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F2EC] px-5 py-12 text-[#292923]">
      <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center">
        <Link
          to="/"
          className="mb-12 text-center text-xs uppercase tracking-[0.3em] text-[#77756D]"
        >
          ← Glass n Wood
        </Link>

        <div className="border border-[#DED8CC] bg-[#FBF9F5] p-8 sm:p-10">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#8A765B]">
            Management Portal
          </p>

          <h1 className="font-serif text-4xl tracking-tight">Welcome back.</h1>

          <p className="mt-3 text-sm leading-6 text-[#77756D]">
            Sign in to manage your projects and enquiries.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-[#D8D2C7] bg-transparent px-4 py-3 outline-none focus:border-[#8A765B]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#D8D2C7] bg-transparent px-4 py-3 outline-none focus:border-[#8A765B]"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#292923] px-5 py-3 text-sm text-white transition hover:bg-[#51483B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[#8A877F]">
            Authorized access only.
          </p>
        </div>
      </div>
    </main>
  );
}
