import { createUser } from "../services/auth.service.js";
import { validateSignup } from "../validators/auth.validator.js";

export const signup = async (req, res) => {
  try {
    const error = validateSignup(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    const statusCode =
      err.message === "Email already registered" ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};


// Login API
import { loginUser } from "../services/auth.service.js";
export const login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } =
      await loginUser(req.body);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR 👉", error.message);

    res.status(400).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};
