import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Admin creates user (signup)
export const createUser = async (req, res, next) => {
  try {
    // Only admin can create users
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can create users" });
    }

    const { name, email, role, phone, status } = req.body;

    // Validate role
    const allowedRoles = ["admin", "manager", "sales"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Validate status
    const allowedStatus = ["active", "inactive"];
    if (status && !allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // const user = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role,
    //   phone,
    //   status: status || 'active',
    // });

    // Create user without password
    const user = await User.create({
      name,
      email,
      role,
      phone,
      status: status || "active",
    });

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save({ validateBeforeSave: false });

    // Send email with token link
    const resetURL = `${process.env.CLIENT_URL}/set-password?token=${resetToken}`;

    const message = `
           <h2>Hello ${user.name}</h2>
           <p>Please set your password by clicking the link below:</p>
           <a href="${resetURL}" target="_blank">Set Password</a>
           <p>This link is valid for 24 hours.</p>
        `;
    await sendEmail({
      email: user.email,
      subject: "Set Your Password",
      message,
      html: true,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
    };
    res.status(201).json({
      success: true,
      message: "User created and password setup email sent",
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};



// set password endpoint (for first-time setup & reset password)
export const setPassword = async (req, res, next) => {
  try {
    // token from URL
   //  const token = req.query.token || req.params.token;

   const token = req.headers.authorization?.split(" ")[1] || req.query.token || req.params.token;

    // password from body
    const { password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });
    }

    // hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user using token only
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token invalid or expired" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // set new password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Login endpoint
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact admin.",
      });
    }

    // Only allow specific roles
    const allowedRoles = ["admin", "manager", "sales"];
    if (!allowedRoles.includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "User role not allowed to login" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
