import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectDB = async () => {
  try {
    const preferredUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    let uri = preferredUri;

    // A temporary in-memory database is useful while developing locally, but
    // it is not a production database. On Render it would lose all data on a
    // restart and can fail while trying to download its MongoDB binary.
    if (process.env.NODE_ENV === "production" && !uri) {
      throw new Error("MONGODB_URI (or MONGO_URI) must be configured in production");
    }

    if (!uri || uri.includes("127.0.0.1:27017") || uri.includes("localhost:27017")) {
      try {
        if (!uri) {
          throw new Error("No Mongo URI provided");
        }
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (error) {
        console.warn(`Primary MongoDB connection failed, falling back to in-memory database: ${error.message}`);
      }

      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }
      uri = await mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
