import 'dotenv/config';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { projects } from '../../../src/data/projects.js';

/**
 * Import the site's existing sample project records into MongoDB as UNPUBLISHED.
 * This deliberately prevents illustrative/sample content from appearing publicly.
 * Run from the server directory: npm run seed:projects
 */
async function seedProjects() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be set in server/.env before seeding projects.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  let inserted = 0;
  let updated = 0;

  try {
    for (const item of projects) {
      if (!item?.slug || !item?.title || !item?.cover) {
        console.warn(`[seed] Skipping incomplete project: ${item?.slug || item?.title || 'unknown'}`);
        continue;
      }

      const payload = {
        title: item.title,
        slug: item.slug,
        category: item.category,
        status: item.status === 'Ongoing' ? 'Ongoing' : 'Completed',
        location: item.location || '',
        ...(Number.isFinite(item.year) ? { year: item.year } : {}),
        description: item.description || `Explore this ${String(item.category || 'interior').toLowerCase()} project by Glass n Wood.`,
        cover: item.cover,
        gallery: Array.isArray(item.gallery) ? item.gallery : [],
        featured: Boolean(item.featured),
      };

      const result = await Project.updateOne(
        { slug: item.slug },
        { $set: payload, $setOnInsert: { published: false } },
        { upsert: true, runValidators: true },
      );

      if (result.upsertedCount) inserted += 1;
      else if (result.modifiedCount) updated += 1;
    }

    console.info(`[seed] Complete. Inserted: ${inserted}; updated: ${updated}.`);
    console.info('[seed] All newly inserted projects are unpublished. Review photos, descriptions, and project facts before publishing.');
  } finally {
    await mongoose.disconnect();
  }
}

seedProjects().catch((error) => {
  console.error('[seed] Failed:', error.message);
  process.exitCode = 1;
});
