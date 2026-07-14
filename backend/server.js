import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
// Render provides the port dynamically; fall back to 5000 for local development.
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
// CLIENT_URL and FRONTEND_URL may each contain a comma-separated list of origins.
// This makes it possible to allow the production Vercel deployment without
// opening the API to every Vercel site.
const configuredOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([
  ...configuredOrigins,
  // Current production deployment. Prefer setting CLIENT_URL on Render so a
  // future custom domain can be added without changing application code.
  "https://reddrop-lucw-three.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

// Vercel creates a different preview hostname for each Git branch/commit.
// Limit the wildcard to this project's deployment names rather than allowing
// every *.vercel.app origin.
const isRedDropVercelDeployment = (origin) =>
  /^https:\/\/reddrop-lucw(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

connectDB();


app.disable("x-powered-by");
// Trust the Render proxy so secure cookies and forwarded headers work correctly.
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim();
      if (
        ALLOWED_ORIGINS.has(normalizedOrigin) ||
        isRedDropVercelDeployment(normalizedOrigin) ||
        /^https:\/\/(.+\.)?onrender\.com$/.test(normalizedOrigin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      callback(new Error("CORS policy blocked this origin."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Health check endpoint used by Render and deployment monitoring.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RedDrop Backend API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/drives", driveRoutes);
// Compatibility alias so existing donor-search frontend requests resolve correctly.
app.use("/api/donors", donorRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`RedDrop backend running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is already in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error("Server failed to start:", error);
    process.exit(1);
  });
};

startServer(Number(PORT));
