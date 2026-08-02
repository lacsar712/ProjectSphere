import mongoose from 'mongoose';
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
    console.log("connected to database");
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

export { connectDB };
