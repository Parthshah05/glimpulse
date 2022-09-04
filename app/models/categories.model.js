const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category_color: {
      type: String,
      required: true,
    },
    key: {
      type: String,
    },
    keywords: [String],
    url: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    tag_of_day: {
      type: Boolean,
      default: false,
    },
    sort_order: {
        type: Number,
        default: 9999
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
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
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Category", categorySchema);
