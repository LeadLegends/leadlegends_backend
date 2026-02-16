import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // required: true,
      minlength: 6,
      select: false, // important for security so that password doesn't leak in queries by default
    },

    role: {
      type: String,
      enum: ["admin", "manager", "sales"],
      required: true,
      default: "sales",
    },

    phone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
