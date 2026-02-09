import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/token.util.js";

/**
 * =========================
 * SIGNUP SERVICE
 * =========================
 */
export const createUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    ...userData,
    password: hashedPassword,
    isEmailVerified: false // 🔒 correct default
  });

  return user;
};

/**
 * =========================
 * LOGIN SERVICE
 * =========================
 */
export const loginUser = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid request data");
  }

  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // 🔐 Explicitly include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 🚫 BLOCK ONLY IN PRODUCTION
  if (
    process.env.NODE_ENV === "production" &&
    !user.isEmailVerified
  ) {
    throw new Error("Email not verified. Please verify your email.");
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const payload = {
    userId: user._id,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 🧹 remove password before sending back
  user.password = undefined;

  return {
    user,
    accessToken,
    refreshToken
  };
};