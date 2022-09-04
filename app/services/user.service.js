const mongoose = require("mongoose");

let User = require("../models/users.model.js");
let UnregisterUser = require("../models/unregister_users.model.js");

/* -------------- MASTER USER MODULE ----------- */
/* get all user */
exports.getAllUser = async () => {
  return await User.find().select("first_name last_name phone_number dob");
};
/* get user by its phone number */
exports.getUserByPhoneNumber = async (phone_number) => {
  return await User.findOne({ phone_number: phone_number });
};

/* get user by its email */
exports.getUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};

/* get user by its id */
exports.getUserById = async (user_id) => {
  return await User.findOne({ _id: user_id }).populate("received_glimpulses");
};

/* get received glimpulses */
exports.receivedGlimpulses = async (user_id) => {
  let query = {
    path: "received_glimpulses",
    select:
      "cover_id photo_id user_image_id text_image_id text bg_color text_color category_id created_by created_at updated_at published_date url status active_step",
    populate: {
      path: "created_by",
      select: "_id image_id",
    },
  };
  return await User.findOne({ _id: user_id }).populate(query);
};

/* remove glimpulses */
exports.removeGlimpulses = async (user_id, glimpulse_id) => {
  return await User.findByIdAndUpdate(
    user_id,
    { $pull: { received_glimpulses: glimpulse_id } },
    { new: true }
  );
};

/* remove multiple glimpulses */
exports.removeMultipleGlimpulses = async (user_id, glimple_ids) => {
  let glimple_with_object_id = [];
  for (let glimple_id of glimple_ids) {
    glimple_with_object_id.push(mongoose.Types.ObjectId(glimple_id));
  }
  return await User.updateOne(
    { _id: user_id },
    {
      $pull: {
        received_glimpulses: {
          $in: glimple_with_object_id,
        },
      },
    },
    { new: true }
  );
};

/* get user by its id without password */
exports.getUserByIdWithoutPassword = async (user_id) => {
  return await User.findOne({ _id: user_id }).select("-password");
};

/* get user by its id without password */
exports.getUserByIdWithoutPassword = async (user_id) => {
  return await User.findOne({ _id: user_id }).select("-password");
};

/* get user by it email and id */
exports.getUserByEmailAndId = async (user) => {
  return await User.findOne({ email: user.email, _id: user.user_id });
};

/* insert new user  */
exports.insertNewUser = async (user) => {
  return await User.insertMany([user]);
};

/* create new user  */
exports.createNewUser = async (user) => {
  return await User.create(user);
};

/* update user */
exports.updateUser = async (user_id, user) => {
  return await User.findOneAndUpdate(
    {
      _id: user_id,
    },
    { $set: user },
    { new: true }
  ).select("-password");
};

/* log out user */
exports.logoutUser = async (user_id, req_data) => {
  return await User.updateOne(
    {
      _id: user_id,
      "login_activity.device_info.device_id": req_data.device_id,
    },
    {
      $set: {
        "login_activity.$.is_login": false,
        "login_activity.$.logout_time": new Date(),
      },
    }
  );
};

/* total number of user created glimpulse counters */
exports.increaseTotalCreatedUserGlimpulse = async (user_id) => {
  return await User.findOneAndUpdate(
    { _id: user_id },
    { $inc: { total_created_glimples: 1 } }
  );
};

/* add user visited glimpulse */
exports.addIntoUserVisitedGlimpulse = async (payload) => {
  return await User.updateOne(
    {
      _id: payload.user_id,
      received_glimpulses: { $nin: [payload.glimple_id] },
    },
    {
      $push: { received_glimpulses: payload.glimple_id },
    }
  );
};

/* delete user */
exports.deleteUser = async (user_id) => {
  return User.deleteOne({ _id: user_id });
};

/* delete multiple user */
exports.deleteMultipleUser = async (user_ids) => {
  return User.deleteMany({ _id: user_ids });
};

/* total number of user created glimpulse counters */
exports.increaseTotalCreatedUserGlimpulse = async (user_id) => {
  return await User.findOneAndUpdate(
    { _id: user_id },
    { $inc: { total_created_glimples: 1 } }
  );
};

/* delete user */
exports.deleteUser = async (user_id) => {
  return User.deleteOne({ _id: user_id });
};

/* delete multiple user */
exports.deleteMultipleUser = async (user_ids) => {
  return User.deleteMany({ _id: user_ids });
};

/* -------------- UNREGISTER USER MODULE ----------- */
/* get unregister user */
exports.getUnregisterUser = async (phone_number) => {
  return await UnregisterUser.findOne({ phone_number: phone_number });
};

/* update unregister user */
exports.updateUnregisterUser = async (user) => {
  return await UnregisterUser.findOneAndUpdate(
    {
      phone_number: user.phone_number,
    },
    { $set: user },
    { new: true }
  ).select("-password");
};

/* create unregister user */
exports.createUnregisterUser = async (user) => {
  let created_user = await UnregisterUser.create(user);
  return created_user;
};

/* delete unregister user */
exports.deleteUnregisterUser = async (user_id) => {
  let deleted_user = await UnregisterUser.deleteOne({ _id: user_id });
  return deleted_user;
};

/* set response */
exports.setResponse = async (user) => {
  return await {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    dob: user.dob,
    email: user.email,
    image_id: user.image_id,
    country_code: user.country_code,
  };
};
