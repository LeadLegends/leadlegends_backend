import bcrypt from "bcryptjs";
import Otp from "../models/otp.model.js";
import User from "../models/user.model.js";
import { sendOtpEmail } from "../utils/mail.util.js";

const OTP_EXPIRY_MINUTES = 10;

export const sendOtpService = async (email, type) => {
  if (!email || !type) {
    const err = new Error("Email and OTP type are required");
    err.statusCode = 400;
    throw err;
  }

  if (!["email_verification", "forgot_password"].includes(type)) {
    const err = new Error("Invalid OTP type");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("User not found with this email");
    err.statusCode = 404;
    throw err;
  }

  // ❌ REMOVED: await Otp.deleteMany({ email, type });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // ✅ OTP WILL ALWAYS BE SAVED
  await Otp.create({
    email,
    otp: hashedOtp,
    type,
    expiresAt
  });

  try {
    await sendOtpEmail({ to: email, otp });
  } catch (e) {
    const err = new Error("Failed to send OTP email");
    err.statusCode = 500;
    throw err;
  }

  return true;
};

export const verifyOtpService = async (email, otp, type) => {
  if (!email || !otp || !type) {
    const err = new Error("Email, OTP and type are required");
    err.statusCode = 400;
    throw err;
  }

  const otpRecord = await Otp.findOne({ email, type });

  if (!otpRecord) {
    const err = new Error("OTP not found");
    err.statusCode = 400;
    throw err;
  }

  if (otpRecord.expiresAt < new Date()) {
    const err = new Error("OTP has expired");
    err.statusCode = 400;
    throw err;
  }

  const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOtpValid) {
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    throw err;
  }

  if (type === "email_verification") {
    await User.updateOne(
      { email },
      { isEmailVerified: true }
    );
  }

  // ❌ REMOVED: await Otp.deleteOne({ _id: otpRecord._id });

  // ✅ OTP STAYS IN DATABASE
  return true;
};
