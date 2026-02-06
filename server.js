import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
// Load env vars
dotenv.config();

// App init
const app = express();

// Environment
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================
// Global Middleware
// ==================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());
connectDB();

// Logger (dev only)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==================
// Routes
// ==================
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running 🚀',
    env: NODE_ENV
  });
});

// MVC Routes
// import sampleRoutes from './routes/sample.routes.js';
// app.use('/api/sample', sampleRoutes);

// ==================
// Error Handling
// ==================
import errorHandler from './middlewares/error.middleware.js';
app.use(errorHandler);

// ==================
// Start Server
// ==================
app.listen(PORT, () => {
  console.log(`🔥 Server running in ${NODE_ENV} mode on port ${PORT}`);
});
