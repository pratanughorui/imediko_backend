// models/Practice.js
const mongoose = require("mongoose");

const practiceSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dayOfWeek: {
      type: [String], // ["Monday", "Wednesday"]
      required: true,
    },
    fromTime: {
      type: String, // "10:00 AM"
      required: true,
    },
    toTime: {
      type: String, // "2:00 PM"
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Practice", practiceSchema);
