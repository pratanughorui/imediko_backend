// models/Practice.js
const mongoose = require("mongoose");

const practiceSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    practice_name: {
      type: String,
      required: true,
      trim: true,
    },

    practice_type: {
      type: String,
      required: true,
      enum: ["Clinic", "Hospital", "Chamber", "Diagnostic Center"],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    consultation_fee: {
      type: Number,
      required: true,
      min: 0,
    },

    slot_duration: {
      type: Number,
      required: true,
      default: 15,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

module.exports = mongoose.model("Practice", practiceSchema);
