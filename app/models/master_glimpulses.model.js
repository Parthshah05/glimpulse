const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const masterGlimpulseSchema = new Schema(
  {
    title: {
      type: String,
    },
    glimple_of_day: {
      type: Boolean,
      default: false,
    },
    identifier: {
      type: String,
    },
    have_web: {
      type: String,
      default: 1,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
    is_popular: {
      type: Boolean,
      default: false,
    },
    public_id: {
      type: String,
    },
    keywords: [String],
    sort_order: {
      type: Number,
    },
    url: {
      type: String,
    },
    audio: {
      type: String,
    },
    total_user_created_glimples: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Draft",
    },
    artist: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    publish_info: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    type_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
      },
    ],
    subcategory_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],

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

module.exports = mongoose.model("MasterGlimpulse", masterGlimpulseSchema);
