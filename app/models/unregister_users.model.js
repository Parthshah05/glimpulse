const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const unregisterUserSchema = new Schema(
  {
    phone_number: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
    },
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
    },
    dob: {
      type: String,
    },
    password: {
      type: String,
    },
    login_activity: [
      {
        is_login: {
          type: Boolean,
          default: false,
        },
        device_info: Object,
        logout_time: Date,
        created_at: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("UnregisterUser", unregisterUserSchema);
