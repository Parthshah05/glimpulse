const mongoose = require("mongoose");

const UserCreatedGlimpulse = require("../models/user_created_glimpulses.model");

/* get user created glimpulse list */
exports.getUserCreatedGlimpulseList = async (
  page,
  per_page,
  order_by,
  order_type
) => {
  return UserCreatedGlimpulse.find({ is_deleted: false })
    .limit(per_page)
    .skip(per_page * page)
    .sort({ [order_by]: order_type })
    .select(
      "active_step status cover_id user_image_id photo_id text_image_id text text_color bg_color category_id "
    )
    .populate("category_id", "name category_color keywords key sort_order");
};

/* total user created glimpulse count */
exports.totalUserCreatedGlimpulseCount = async () => {
  return UserCreatedGlimpulse.count({ is_deleted: false });
};

/* get glimple by id */
exports.getUserGlimplseById = async (glimple_id) => {
  return UserCreatedGlimpulse.findOne({
    _id: glimple_id,
    is_deleted: false,
  }).populate("category_id created_by updated_by");
};

/* get glimple by user id */
exports.getUserGlimpulseByUserId = async (user_id) => {
  return UserCreatedGlimpulse.findOne({
    created_by: user_id,
    is_deleted: false,
  }).populate("category_id created_by");
};

/* get glimple by field */
exports.getGlimpleByField = async (field_name, field_value) => {
  return UserCreatedGlimpulse.findOne({
    [field_name]: field_value,
    is_deleted: false,
  }).populate("category_id created_by");
};

/* get glimple by field */
exports.getGlimpleByStatus = async (
  status,
  page,
  per_page,
  order_by,
  order_type,
  user_id
) => {
  return UserCreatedGlimpulse.aggregate([
    {
      $match: {
        status: status,
        created_by: new mongoose.Types.ObjectId(user_id),
        is_deleted: false,
      },
    },
    {
      $sort: {
        [order_by ? order_by : "created_at"]: order_type ? order_type : 1,
      },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(page) } },
        ],
        data: [{ $skip: per_page * page }, { $limit: per_page }],
      },
    },
  ]);
};

/* create new user glimple */
exports.createNewUserGlimpulse = async (user_glimple) => {
  return UserCreatedGlimpulse.create(user_glimple);
};

/* increase visit count */
exports.increaseVisitCount = async (payload) => {
  return await UserCreatedGlimpulse.findOneAndUpdate(
    { _id: payload.glimple_id },
    { $inc: { visit_count: 1 } },
    { new: true }
  );
};

/* update user glimple */
exports.updateUserGlimpulse = async (glimple_id, user_glimple) => {
  return await UserCreatedGlimpulse.findOneAndUpdate(
    { _id: glimple_id },
    { $set: user_glimple },
    { new: true }
  );
};

/* delete user created glimple */
exports.deleteUserCreatedGlimpulse = async (glimple_id) => {
  return UserCreatedGlimpulse.deleteOne({ _id: glimple_id });
};

/* delete multiple user created glimple */
exports.deleteMultipleUserCreatedGlimpulse = async (glimple_ids) => {
  return UserCreatedGlimpulse.deleteMany({ _id: glimple_ids });
};

/* Change draft Status */
exports.updateStatus = async (id) => {
  return await UserCreatedGlimpulse.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        is_deleted: true,
      },
    },
    { new: true }
  );
};

/* set response */
exports.setResponse = async (user_created_glimpulse) => {
  return await {
    _id: user_created_glimpulse._id,
    uuid: user_created_glimpulse.uuid,
    cover_id: user_created_glimpulse.cover_id,
    photo_id: user_created_glimpulse.photo_id,
    text_image_id: user_created_glimpulse.text_image_id,
    user_image_id: user_created_glimpulse.user_image_id,
    text: user_created_glimpulse.text,
    text_color: user_created_glimpulse.text_color,
    bg_color: user_created_glimpulse.bg_color,
    active_step: user_created_glimpulse.active_step,
    url: user_created_glimpulse.url,
    category_id: user_created_glimpulse.category_id
      ? user_created_glimpulse.category_id._id
      : "",
    status: user_created_glimpulse.status,
    created_by: {
      _id: user_created_glimpulse.created_by
        ? user_created_glimpulse.created_by._id
        : "",
      image_id: user_created_glimpulse.created_by
        ? user_created_glimpulse.created_by.image_id
        : "",
    },
  };
};
