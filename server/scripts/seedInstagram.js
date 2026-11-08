
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import InstagramPost from "../src/models/InstagramPost.js";

// Load server/.env explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Existing Instagram posts to migrate
const instagramUrls = [
  "https://www.instagram.com/glassnwood.in/reel/DfAFxwaiiTh/",
  "https://www.instagram.com/glassnwood.in/reel/DfMuTeOgm89/",
  "https://www.instagram.com/glassnwood.in/reel/DaH4I7KCgnM/",
  "https://www.instagram.com/glassnwood.in/reel/DeG0_bAS1jd/",
  "https://www.instagram.com/glassnwood.in/reel/De1N7b9C4nF/",
  "https://www.instagram.com/glassnwood.in/reel/De675WpyjlN/",
  "https://www.instagram.com/glassnwood.in/reel/DfHqYGnCBRs/",
];

function parseInstagramUrl(rawUrl) {
  const url = new URL(rawUrl);

  if (
    !["instagram.com", "www.instagram.com"].includes(url.hostname)
  ) {
    throw new Error(`Invalid Instagram domain: ${rawUrl}`);
  }

  const segments = url.pathname.split("/").filter(Boolean);

  const typeIndex = segments.findIndex((segment) =>
    ["reel", "p"].includes(segment)
  );

  if (typeIndex === -1 || !segments[typeIndex + 1]) {
    throw new Error(`Invalid Instagram post URL: ${rawUrl}`);
  }

  const type = segments[typeIndex] === "p" ? "post" : "reel";
  const shortcode = segments[typeIndex + 1];

  return {
    url: `https://www.instagram.com/${
      type === "post" ? "p" : "reel"
    }/${shortcode}/`,
    shortcode,
    type,
  };
}

async function seedInstagram() {
  try {
    // Read the correct MongoDB variable
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is missing from server/.env"
      );
    }

    // Connect only once
    await mongoose.connect(mongoUri);

    console.log("[migration] Connected to MongoDB.");

    // Prepare upsert operations to prevent duplicate records
    const operations = instagramUrls.map((rawUrl, index) => {
      const post = parseInstagramUrl(rawUrl);

      return {
        updateOne: {
          filter: { shortcode: post.shortcode },
          update: {
            $set: {
              ...post,
              isPublished: true,
              displayOrder: index,
            },
          },
          upsert: true,
        },
      };
    });

    // Insert or update all seven posts
    const result = await InstagramPost.bulkWrite(operations);

    console.log("[migration] Instagram migration completed.");

    console.table({
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      matched: result.matchedCount,
      total: instagramUrls.length,
    });

    // Verify saved records
    const savedPosts = await InstagramPost.find({
      shortcode: {
        $in: instagramUrls.map(
          (url) => parseInstagramUrl(url).shortcode
        ),
      },
    })
      .sort({ displayOrder: 1 })
      .select("url shortcode type isPublished displayOrder")
      .lean();

    console.log("[migration] Verified records:", savedPosts.length);

    savedPosts.forEach((post) => {
      console.log(
        `${post.displayOrder + 1}. ${post.type}: ${post.shortcode} | Published: ${post.isPublished}`
      );
    });

    if (savedPosts.length !== instagramUrls.length) {
      throw new Error("Not all Instagram posts were saved successfully.");
    }
  } catch (error) {
    console.error("[migration] Failed:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("[migration] MongoDB disconnected.");
    }
  }
}

seedInstagram();
