const Bcrypt = require("bcryptjs");
let User = require("../models/users.model.js");
const userService = require("../services/user.service");
const cloudinaryService = require("../services/cloudinary.service");

const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");

/* for user list */
exports.list = async (req, res, next) => {
  try {
    let users = await userService.getAllUser();
    return res.status(200).json(successResponse(constants.USER_LIST, users));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create new user */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    let already_exist = await userService.getUserByPhoneNumber(
      req_data.phone_number
    );
    if (already_exist) {
      return res.status(400).json(errorResponse(constants.USER_ALREADY_EXIST));
    }
    req_data.password = await Bcrypt.hashSync(req_data.password, 10);

    let created_user = await userService.createNewUser(req_data);

    let payload = await userService.setResponse(created_user);
    return res
      .status(200)
      .json(successResponse(constants.USER_CREATE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update user */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    let already_exist = await userService.getUserById(req.params.id);
    if (!already_exist) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    if (req_data.password) {
      req_data.password = await Bcrypt.hashSync(req_data.password, 10);
    }
    let updated_user = await userService.updateUser(req.params.id, req_data);

    let payload = await userService.setResponse(updated_user);

    res
      .status(200)
      .json(successResponse(constants.USER_UPDATE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get user by id */
exports.getById = async (req, res, next) => {
  try {
    let user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    res.status(200).json(successResponse(constants.USER_BY_ID, user));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* user visited glimpulse */
exports.userVisitedGlimpulse = async (req, res) => {
  try {
    const user_id = req.userData.id;

    const per_page = req.query.perPage ? parseInt(req.query.perPage) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 0;

    const user_visited_glimpulses = await userService.receivedGlimpulses(
      user_id
    );

    let visited_glimpulses = user_visited_glimpulses.received_glimpulses.slice(
      (page - 1) * per_page,
      page * per_page
    );

    let payload = [
      {
        metadata: [
          {
            total: user_visited_glimpulses.received_glimpulses
              ? user_visited_glimpulses.received_glimpulses.length
              : 0,
            page: page,
          },
        ],
        data: visited_glimpulses,
      },
    ];

    if (user_visited_glimpulses.received_glimpulses) {
      return res
        .status(200)
        .json(successResponse(constants.USER_VISITED_GLIMPULSE, payload));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get profile */
exports.getProfile = async (req, res) => {
  try {
    let user_id = req.userData.id;
    let user = await userService.getUserByIdWithoutPassword(user_id);
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    let payload = await userService.setResponse(user);

    res.status(200).json(successResponse(constants.GET_PROFILE, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* update profile */
exports.updateProfile = async (req, res) => {
  try {
    let req_data = req.body;
    let user_id = req.userData.id;
    let user = await userService.getUserByIdWithoutPassword(user_id);
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    // if (
    //   req_data.image_id &&
    //   user.image_id &&
    //   user.image_id !== req_data.image_id
    // ) {
    //   await cloudinaryService.uploader.destroy(user.image_id);
    // }
    let updated_user = await userService.updateUser(user_id, req_data);

    let payload = await userService.setResponse(updated_user);

    res.status(200).json(successResponse(constants.UPDATE_PROFILE, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete user */
exports.delete = async (req, res, next) => {
  try {
    let user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    await userService.deleteUser(req.params.id);
    res.status(200).json(successResponse(constants.USER_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for multiple delete user */
exports.deleteMany = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.user_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.USER_ID_CANT_BE_EMPTY));
    }
    await userService.deleteMultipleUser(req_data.user_ids);
    res.status(200).json(successResponse(constants.USER_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* Remove user visited glimpulse */
exports.removeUserVisitedGlimpulse = async (req, res) => {
  try {
    const user_id = req.userData.id;
    const glimpulse_id = req.params.id;

    const user_visited_glimpulses = await userService.removeGlimpulses(
      user_id,
      glimpulse_id
    );

    const data = await userService.receivedGlimpulses(user_id);
    if (user_visited_glimpulses) {
      return res
        .status(200)
        .json(successResponse(constants.USER_GLIMPULSE_UPDATE_SUCCESS, data));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
/* Remove multiple user visited glimpulse */
exports.removeMultipleUserVisitedGlimpulse = async (req, res) => {
  try {
    const user_id = req.userData.id;
    const glimple_ids = req.body.glimple_ids;

    const user_visited_glimpulses = await userService.removeMultipleGlimpulses(
      user_id,
      glimple_ids
    );

    const data = await userService.receivedGlimpulses(user_id);
    if (user_visited_glimpulses) {
      return res
        .status(200)
        .json(successResponse(constants.USER_GLIMPULSE_UPDATE_SUCCESS, data));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
