const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settingSchema = new Schema(
  {
    setting_name: {
      type: String,
    },
    order_by: {
      type: String,
      default: "",
    },
    order_type: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
