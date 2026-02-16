import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    jobTitle: {
      type: String,
      trim: true,
    },
    
    source: {
      type: String,
      enum: [
        "Website",
        "Phone Call",
        "Email",
        "WhatsApp",
        "Facebook",
        "Instagram",
        "Referral",
        "Manual",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Interested",
        "Not Interested",
        "Converted",
        "Lost",
      ],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String,
      trim: true,
    },

    isConverted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
     // default: null,// here we will make changes later
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);