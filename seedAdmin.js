import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import connectDB from "./config/db.js";

dotenv.config();

const runSeeder = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@leadlegends.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("Admin created successfully!");
    // console.log(admin);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runSeeder();