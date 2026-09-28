import mongoose from 'mongoose';

const cache = globalThis.__notatiMongo ?? (globalThis.__notatiMongo = { promise: null });
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured.');
  if (!cache.promise) cache.promise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .catch(error => { cache.promise = null; throw error; });
  await cache.promise;
  return mongoose.connection;
}
