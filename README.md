# Glass n Wood — website + API

React 18, Vite, Tailwind CSS, React Router, Redux Toolkit, and an optional Node.js/Express + MongoDB API scaffold.

> **Production status:** this is a production-oriented foundation, not a fully launched production service yet. Real project photos/content, deployment environment variables, MongoDB credentials, final domain/CORS settings, and an authenticated admin/CMS still need to be configured. No credentials belong in source control.

## Requirements

- Node.js 20 or later (Node 22 LTS recommended)
- npm
- MongoDB Atlas or a reachable MongoDB instance to persist enquiries and serve database-backed projects

## Frontend setup

From the project root:

```bash
npm ci
cp .env.example .env
npm run dev
```

By default, `VITE_USE_API=false` uses the local sample project data, so the UI can be developed before MongoDB is configured. Sample projects are placeholders, not verified Glass n Wood work.

To use the API locally:

1. In a second terminal, configure and start the backend (see below).
2. Set `VITE_USE_API=true` in the root `.env`.
3. Restart Vite. The dev server proxies `/api` to `http://localhost:5000`.

For a separately deployed API, set `VITE_API_URL=https://your-api-domain.example` and `VITE_USE_API=true`. `VITE_*` variables are public build-time values; never put database credentials or secret tokens in them.

## Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `server/.env` to your MongoDB connection string, and set `CLIENT_ORIGINS` to the exact origin(s) that serve the frontend. Then run:

```bash
npm run dev
```

The API runs on port 5000 by default. For production, set `NODE_ENV=production`, configure `CLIENT_ORIGINS`, set `REQUIRE_DATABASE=true`, and configure the hosting platform's proxy setting if needed (`TRUST_PROXY=1` only when running behind one trusted reverse proxy/load balancer).

### API endpoints

- `GET /api/health` — service and database readiness status.
- `GET /api/projects` — published projects only; optional `?category=...` and `?status=Completed|Ongoing` filters.
- `GET /api/projects/:slug` — one published project.
- `POST /api/enquiries` — validates and stores a contact enquiry in MongoDB; rate-limited and includes a honeypot field.

Example enquiry payload:

```json
{
  "name": "Customer name",
  "phone": "+91 90000 00000",
  "email": "customer@example.com",
  "type": "Custom furniture",
  "message": "I'd like to discuss a dining table.",
  "projectSlug": "",
  "website": ""
}
```

Projects are intentionally read-only from the public API. Do not expose create/update/delete endpoints without admin authentication and authorization. Until an authenticated admin dashboard is added, project documents can be managed through MongoDB Compass by an authorized operator; set `published: true` only for approved real projects. Do not publish sample content as real work.

## Images and project data

- `src/data/projects.js` is the local sample-data source used when the API is disabled.
- `src/data/site.js` stores shared business details, service content, and image references.
- Prefer optimized, appropriately licensed images in `public/images/` for production. Keep image metadata (`src`, `alt`, cover, gallery) in the data objects, not duplicated inside page components.
- Replace all sample project descriptions and placeholder images before launch. The API schema supports `cover`, `gallery`, `status`, `featured`, and `published` fields.
- This scaffold does not upload images yet. Future admin image management should use Cloudinary or another object-storage service rather than storing image binaries in MongoDB.

## Instagram

The homepage can show official embeds when public post/reel URLs are added to `instagram.posts` in `src/data/site.js`. Automated Instagram feed syncing is not configured. Add it later through Meta's official API from the backend; never expose Instagram access tokens in React code.

## Contact behavior

- With API mode disabled, the form opens a prefilled email or WhatsApp message; the website does not store the enquiry.
- With API mode enabled, **Submit enquiry** posts to `/api/enquiries` and saves the enquiry in MongoDB. WhatsApp/email remain available as alternatives.
- Configure spam protection and privacy/retention policy before broad public promotion. The included rate limiter and honeypot are basic controls, not a substitute for monitoring or stronger anti-abuse measures.

## Production checks

```bash
npm ci
npm run build
npm run preview
```

Also test mobile layouts, all routes and refreshes, keyboard focus, image failures, form success/error states, API CORS, database outage behavior, HTTPS, backups, and monitoring. Configure the hosting platform to rewrite frontend routes to `index.html` for React Router. Keep frontend and backend deployment variables separate.
