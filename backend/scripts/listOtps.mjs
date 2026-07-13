import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { MONGODB_URI, MONGO_URI } = process.env;
const uri = MONGODB_URI || MONGO_URI;

if (!uri) {
  console.error('No Mongo URI configured in .env (MONGODB_URI or MONGO_URI)');
  process.exit(1);
}

const connect = async () => {
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined });
};

const run = async () => {
  try {
    await connect();
    // Dynamically import the model so relative paths match project structure
    const { default: Otp } = await import('../models/Otp.js');

    const docs = await Otp.find({}).sort({ createdAt: -1 }).limit(20).lean();
    console.log(JSON.stringify(docs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error listing OTPs:', err.message);
    process.exit(1);
  }
};

run();
