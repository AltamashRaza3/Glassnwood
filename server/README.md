# Glass n Wood API

Express API with MongoDB/Mongoose models for public project reads and contact enquiries.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI`.
3. Set `CLIENT_ORIGINS` to the exact frontend origins.
4. Start development: `npm run dev`; production: `npm start`.

Public endpoints: `GET /api/health`, `GET /api/projects`, `GET /api/projects/:slug`, `POST /api/enquiries`.

Project writes are intentionally not public. Add authentication and authorization before building admin CRUD. Project images should be hosted in object storage (e.g. Cloudinary), with URLs saved in MongoDB; do not store image binaries in MongoDB.

## Import the current local project records

After configuring `server/.env` with a valid `MONGODB_URI`, run from `server/`:

```bash
npm run seed:projects
```

This upserts the project's current local records into MongoDB. Newly inserted records are created with `published: false`, so placeholder/illustrative content is not exposed through the public API. Review all photos, descriptions, locations, years, and project status before publishing records in MongoDB. The script preserves the existing `published` value for records already present.
