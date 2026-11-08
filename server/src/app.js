import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes.js';
import projectRoutes from './routes/projects.routes.js';
import enquiryRoutes from './routes/enquiries.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import instagramRoutes from "./routes/instagram.routes.js";
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import productRoutes from "./routes/products.routes.js";


const app = express();
// Trust Vercel's reverse proxy
app.set("trust proxy", 1);

const configuredOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.add('http://localhost:5173');
  allowedOrigins.add('http://127.0.0.1:5173');
  allowedOrigins.add('http://localhost:4173');
  allowedOrigins.add('http://127.0.0.1:4173');
}

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin is not allowed by CORS.'), { status: 403, code: 'CORS_BLOCKED' }));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/', (req, res) => res.json({ name: 'Glass n Wood API', docs: 'See README.md for available endpoints.' }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/products", productRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use("/api/instagram", instagramRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
