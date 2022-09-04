const mongoose = require("mongoose");
const shortid = require("shortid");
const Schema = mongoose.Schema;

const userCreatedGlimpulseSchema = new Schema(
  {
    uuid: {
      type: String,
      default: shortid.generate,
    },
    cover_id: {
      type: String,
      required: true,
    },
    photo_id: {
      type: String,
    },
    text_image_id: {
      type: String,
    },
    user_image_id: {
      type: String,
    },
    text: {
      type: String,
    },
    text_color: {
      type: String,
    },
    bg_color: {
      type: String,
    },
    active_step: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
    },
    visit_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "D",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    published_date: {
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

module.exports = mongoose.model(
  "UserCreatedGlimpulse",
  userCreatedGlimpulseSchema
);
