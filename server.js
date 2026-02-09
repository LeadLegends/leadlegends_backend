import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ==================
// CORS CONFIG
// ==================
const allowedOrigins = [
  "http://localhost:5173",
  
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, server-to-server, cron jobs
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS normally
app.use(cors(corsOptions));

// ✅ SAFE preflight handling (NO wildcard route)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// ==================
// MIDDLEWARE
// ==================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// here are some changes for testing purpose to check if the changes are being tracked by git or not. I am adding some random text here to check the git tracking. This is just a test and will be removed later. I am also adding some more random text to make sure that the changes are significant enough to be tracked by git. This is just a test and will be removed later. 

// ==================
// DATABASE
// ==================
connectDB();

// ==================
// ROUTES
// ==================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server running",
  });
});

app.use("/api/v1/auth", authRoutes);

// ==================
// ERROR HANDLER
// ==================
app.use(errorHandler);

// ==================
// START SERVER
// ==================
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
