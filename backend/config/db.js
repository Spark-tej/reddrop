import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectDB = async () => {
  try {
    const preferredUri = process.env.MONGO_URI;
    let uri = preferredUri;

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
