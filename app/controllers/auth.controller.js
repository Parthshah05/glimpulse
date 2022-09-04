const Bcrypt = require("bcryptjs");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  successResponse,
  errorResponse,
} = require("../common/response.common.js");
const constants = require("../common/constants.common.js");
const userService = require("../services/user.service.js");
const twilioService = require("../services/twilio.service.js");
const emailService = require("../services/mail.service");

exports.get = async (req, res, next) => {
  try {
    res.status(200).json({ message: "testing" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* for register user */
exports.signUp = async (req, res, next) => {
  try {
    let req_data = req.body;
    let unregister_user;
    /* already exist user in master user */
    let already_exist = await userService.getUserByPhoneNumber(
      req_data.phone_number
    );
    if (already_exist) {
      return res.status(400).json(errorResponse(constants.USER_ALREADY_EXIST));
    }

    /* hash password */
    req_data.password = Bcrypt.hashSync(req_data.password, 10);

    /* already exist in unregister_user it update  */
    let already_unregister_user = await userService.getUnregisterUser(
      req_data.phone_number
    );

    if (already_unregister_user) {
      let login_activity = [];
      /* it will add new login activity if same activity not happen before */
      if (already_unregister_user.login_activity.length > 0) {
        login_activity = already_unregister_user.login_activity;
        let alreadyDevice = await already_unregister_user.login_activity.some(
          (activity) =>
            activity.device_info.device_id ===
            req_data.login_activity.device_info.device_id
        );

        if (!alreadyDevice) {
          login_activity.push(req_data.login_activity);
        }
      } else {
        login_activity.push(req_data.login_activity);
      }

      /* update already exist unregister user */
      req_data.login_activity = login_activity;

      unregister_user = await userService.updateUnregisterUser(req_data);
      unregister_user.update = true;
    } else {
      /* create new unregister user */
      unregister_user = await userService.createUnregisterUser(req_data);
      unregister_user.update = false;
    }

    let payload = await userService.setResponse(unregister_user);

    res
      .status(200)
      .json(
        successResponse(
          unregister_user.update
            ? constants.USER_UPDATE_SUCCESS
            : constants.USER_CREATE_SUCCESS,
          payload
        )
      );
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for login user */
exports.login = async (req, res, next) => {
  try {
    let req_data = req.body;
    let token;
    let user;
    if (req_data.phone_number) {
      user = await userService.getUserByPhoneNumber(req_data.phone_number);
    } else {
      user = await userService.getUserByEmail(req_data.email);
    }
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_REGISTERED));
    }
    /* compare password */
    let is_equal = await Bcrypt.compare(req_data.password, user.password);
    if (!is_equal) {
      return res.status(400).json(errorResponse(constants.PASSWORD_INCORRECT));
    }
    if (!user.is_verified) {
      return res.status(400).json(errorResponse(constants.USER_NOT_VERIFIED));
    }
    if (!user.is_active) {
      return res.status(400).json(errorResponse(constants.USER_NOT_ACTIVE));
    }

    /* update or add login activity */
    /* it will add new login activity if same activity not happen before */
    let login_activity = [];
    if (user.login_activity.length > 0) {
      login_activity = user.login_activity;
      let alreadyDevice = await user.login_activity.some(
        (activity) =>
          activity.device_info.device_id ===
          req_data.login_activity.device_info.device_id
      );

      if (!alreadyDevice) {
        req_data.login_activity.created_at = new Date();
        login_activity.push(req_data.login_activity);
      }
    } else {
      req_data.login_activity.created_at = new Date();
      login_activity.push(req_data.login_activity);
    }

    user.login_activity.map((activity) => {
      if (
        activity.device_info.device_id ===
        req_data.login_activity.device_info.device_id
      ) {
        activity.is_login = true;
        activity.logout_time = null;
      }
      return activity;
    });

    let updated_user = await userService.updateUser(user._id, user);

    if (req_data.remember_me) {
      token = await authMiddleware.assignToken(user, "30d");
    } else {
      token = await authMiddleware.assignToken(user);
    }

    let payload = await userService.setResponse(updated_user);

    res.status(200).json(
      successResponse(constants.LOGIN_SUCCESS, {
        token: token,
        user: payload,
      })
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(errorResponse(err.message));
  }
};

/* for sendOtp to user */
exports.sendOtp = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.user_id) {
      let already_exist = await userService.getUserById(req_data.user_id);
      if (
        already_exist &&
        already_exist.phone_number == req_data.phone_number
      ) {
        return res
          .status(200)
          .json(successResponse(constants.PHONE_NUMBER_UPDATE_SUCCESS));
      }
      let is_phone = await userService.getUserByPhoneNumber(
        req_data.phone_number
      );
      if (is_phone) {
        return res
          .status(400)
          .json(errorResponse(constants.PHONE_ALREADY_EXIST));
      }
    }
    if (req_data.country_code) {
      req_data.phone_number = req_data.country_code + req_data.phone_number;
    }
    /* send otp to phone number */
    let response = await twilioService.sendOtp(
      req_data.phone_number,
      req_data.channel
    );
    if (response.status) {
      res.status(200).json(successResponse(constants.OTP_SEND_SUCCESS));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for resendOtp to user */
exports.resendOtp = async (req, res, next) => {
  try {
  } catch (err) {}
};

/* for verifyOtp */
exports.verifyOtp = async (req, res, next) => {
  try {
    let req_data = req.body;
    let token;
    let user;
    if (req_data.country_code) {
      let phone_number = req_data.country_code + req_data.phone_number;
      /* verify phone number otp */
      let response = await twilioService.verifyOtp(phone_number, req_data.otp);
      if (response.status == "pending") {
        return res.status(400).json(errorResponse(constants.CHECK_PHONE_OTP));
      }
    }
    if (req_data.user_id) {
      user = await userService.updateUser(req_data.user_id, {
        phone_number: req_data.phone_number,
      });
    } else {
      let get_unregister_user = await userService.getUnregisterUser(
        req_data.phone_number
      );
      if (get_unregister_user) {
        /* set into another variable for moving it into another table */
        let unregister_user = JSON.stringify(get_unregister_user);
        let new_user = JSON.parse(unregister_user);

        new_user.is_active = true;
        new_user.is_verified = true;

        new_user.login_activity.map((activity) => {
          if (activity.device_info.device_id === req_data.device_id) {
            activity.is_login = true;
          }
          return activity;
        });

        let created_user = await userService.insertNewUser(new_user);
        user = created_user[0];
        token = await authMiddleware.assignToken(user);
        await userService.deleteUnregisterUser(get_unregister_user._id);
      }
    }
    let payload;
    if (user) {
      payload = await userService.setResponse(user);
    }

    res.status(200).json(
      successResponse(constants.OTP_VERIFY_SUCCESS, {
        token: token,
        user: payload,
      })
    );
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for email otp sending */
exports.sendEmailOtp = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.user_id) {
      let already_exist = await userService.getUserById(req_data.user_id);
      if (already_exist && already_exist.email == req_data.email) {
        return res
          .status(200)
          .json(successResponse(constants.EMAIL_UPDATE_SUCCESS));
      }
      let is_email = await userService.getUserByEmail(req_data.email);
      if (is_email) {
        return res
          .status(400)
          .json(errorResponse(constants.EMAIL_ALREADY_EXIST));
      }
    }
    /* send otp to email */
    let response = await emailService.sendEmailOtp(req_data.email);
    if (response.status) {
      res.status(200).json(successResponse(constants.OTP_SEND_SUCCESS));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for verify email Otp */
exports.verifyEmailOtp = async (req, res, next) => {
  try {
    let req_data = req.body;
    let token;
    /* verify email otp */
    let response = await emailService.verifyEmailOtp(
      req_data.email,
      req_data.otp
    );
    if (response.status == "pending") {
      return res.status(400).json(errorResponse(constants.CHECK_PHONE_OTP));
    }
    let updated_user = await userService.updateUser(req_data.user_id, {
      email: req_data.email,
    });

    let payload = await userService.setResponse(unregister_user);

    res
      .status(200)
      .json(successResponse(constants.OTP_VERIFY_SUCCESS, { user: payload }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* forgot password */
exports.forgotPassword = async (req, res) => {
  try {
    let req_data = req.body;
    let user = await userService.getUserByPhoneNumber(req_data.phone_number);
    if (!user) {
      return res
        .status(400)
        .json(errorResponse(constants.PHONE_NOT_REGISTERED));
    }
    if (req_data.country_code) {
      req_data.phone_number = req_data.country_code + req_data.phone_number;
    }
    /* send otp to phone number */
    let response = await twilioService.sendOtp(req_data.phone_number);
    if (response.status) {
      res.status(200).json(successResponse(constants.OTP_SEND_SUCCESS));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* change password */
exports.resetPassword = async (req, res) => {
  try {
    let req_data = req.body;
    let user = await userService.getUserByPhoneNumber(req_data.phone_number);
    if (!user) {
      return res.status(404).json(errorResponse(constants.USER_NOT_FOUND));
    }
    /* encrypt password */
    req_data.new_password = await Bcrypt.hashSync(req_data.new_password, 10);
    await userService.updateUser(user._id, { password: req_data.new_password });
    res.status(200).json(successResponse(constants.PASSWORD_UPDATE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* change password */
exports.changePassword = async (req, res) => {
  try {
    let user_id = req.userData.id;
    const user = await userService.getUserById(user_id);
    if (!user) {
      return res.status(400).json(errorResponse(constants.USER_NOT_FOUND));
    }

    let is_equal = await Bcrypt.compare(req.body.old_password, user.password);

    if (!is_equal) {
      return res
        .status(400)
        .json(errorResponse(constants.OLD_PASSWORD_INCORRECT));
    }

    req.body.new_password = await Bcrypt.hashSync(req.body.new_password, 10);

    await userService.updateUser(user._id, {
      password: req.body.new_password,
    });
    res.status(200).json(successResponse(constants.PASSWORD_UPDATE_SUCCESS));
  } catch (e) {
    res.status(500).json(errorResponse(e.message));
  }
};

/* for logout user */
exports.logout = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_id = req.userData.id;

    await userService.logoutUser(user_id, req_data);
    req.userData = null;
    res.status(200).json(successResponse(constants.LOGOUT_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
