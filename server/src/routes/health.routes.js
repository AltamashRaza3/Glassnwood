import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();
router.get('/', (req, res) => {
  const state = mongoose.connection.readyState;
  const database = ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown';
  const databaseRequired = process.env.REQUIRE_DATABASE === 'true';
  const ready = !databaseRequired || state === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'degraded',
    service: 'glass-n-wood-api',
    database,
    timestamp: new Date().toISOString(),
  });
});
export default router;
