import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
try {
  await connectDatabase();
  if (process.env.REQUIRE_DATABASE === 'true' && process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    // connectDatabase throws if a configured URI cannot connect; missing URI is handled below.
  }
  if (process.env.REQUIRE_DATABASE === 'true' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required when REQUIRE_DATABASE=true.');
  }
  const server = app.listen(port, () => console.info(`[api] Listening on port ${port}.`));
  const shutdown = (signal) => {
    console.info(`[api] ${signal} received; shutting down.`);
    server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error('[api] Startup failed:', error.message);
  process.exit(1);
}
