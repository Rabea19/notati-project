import mongoose from 'mongoose';

const cache = globalThis.__notatiMongo ?? (globalThis.__notatiMongo = {
  connection: null,
  promise: null
});

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    cache.connection = mongoose.connection;
    return cache.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then(mongooseInstance => mongooseInstance.connection)
      .catch(error => {
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
