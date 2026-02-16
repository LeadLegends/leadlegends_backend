import mongoose from "mongoose";

const leadActivitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    activityType: {
      type: String,
      enum: [
        "call",
        "email",
        "whatsapp",
        "meeting",
        "note",
        "status_change",
        "follow_up",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    previousStatus: String,
    newStatus: String,

    nextFollowUpAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("LeadActivity", leadActivitySchema);