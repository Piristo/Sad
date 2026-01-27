import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('DATABASE_URL is not defined');
}

const cached = globalThis.mongoose ?? { conn: null, promise: null };
globalThis.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const UserSchema = new mongoose.Schema(
  {
    tlgid: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
