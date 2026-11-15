import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI missing");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}