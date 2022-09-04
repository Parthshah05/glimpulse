const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailOtpSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    otp: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: false,
    },
    verified_at: {
      type: Date,
    },
    expires_in: {
      type: Date,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    device_info: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailOtp", emailOtpSchema);
