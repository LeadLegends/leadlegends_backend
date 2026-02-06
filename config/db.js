import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error('DB_URI is missing in environment variables');
    }

    const conn = await mongoose.connect(process.env.DB_URI);
    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
