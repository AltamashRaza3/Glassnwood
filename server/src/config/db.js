import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[database] MONGODB_URI is not set; database-backed endpoints will be unavailable.');
    return false;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  console.info('[database] Connected to MongoDB.');
  return true;
}
