import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';


// Routes are here for all the endpoints
// import authRoutes from './routes/auth.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import leadRoutes from './routes/lead.routes.js';
import leadActivityRoutes from './routes/leadActivity.routes.js';
import leadAssignmentRoutes from './routes/leadAssignment.routes.js';



import errorHandler from './middlewares/error.middleware.js';

// Load env vars
dotenv.config();

// App initialization
const app = express();

// Environment
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Global middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());

// Logger (dev only)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to database
connectDB();

// here are some changes for testing purpose to check if the changes are being tracked by git or not. I am adding some random text here to check the git tracking. This is just a test and will be removed later. I am also adding some more random text to make sure that the changes are significant enough to be tracked by git. This is just a test and will be removed later. 

// Routes - Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running smoothly!',
    env: NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/activities', leadActivityRoutes);
app.use('/api/v1/assignments', leadAssignmentRoutes);

// error handler (should be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});



