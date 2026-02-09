import {
  sendOtpService,
  verifyOtpService
} from "../services/otp.service.js";

/**
 * =========================
 * SEND OTP
 * =========================
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;

    await sendOtpService(email, type);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to email"
    });
  } catch (error) {
    next(error); // 🔥 forward to global error handler
  }
};

/**
 * =========================
 * VERIFY OTP
 * =========================
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;

    await verifyOtpService(email, otp, type);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (error) {
    next(error); // 🔥 forward to global error handler
  }
};
