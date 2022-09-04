const { validatePassword, validatePhone } = require("./common.validator");

/* registration shcema */
exports.registrationSchema = {
  phone_number: validatePhone(),
  first_name: {
    notEmpty: true,
    errorMessage: "First Name cannot be empty",
    isLength: {
      options: { max: 30 },
      errorMessage: "First Name must be less than 30 character",
    },
  },
  last_name: {
    notEmpty: true,
    errorMessage: "Last Name cannot be empty",
    isLength: {
      options: { max: 30 },
      errorMessage: "Last Name must be less than 30 character",
    },
  },
  password: validatePassword(),
  login_activity: {
    custom: {
      options: (value) => {
        if (!value.device_info) {
          throw new Error("Login activity cannot be empty");
        }
        if (!value.device_info.device_id) {
          throw new Error("Device info cannot be empty");
        }

        return true;
      },
    },
  },
};

/* login schema */
exports.loginSchema = {
  phone_number: validatePhone(),
  password: validatePassword(),
};

/* password schema */
exports.resetPasswordSchema = {
  phone_number: validatePhone(),
  new_password: validatePassword(),
};

/* password schema */
exports.changePasswordSchema = {
  old_password: validatePassword(),
  new_password: validatePassword(),
};

/* verify otp schema */
exports.verifyOtpSchema = {
  phone_number: validatePhone(),
  otp: {
    notEmpty: true,
    errorMessage: "Otp cannot be empty",
  },
  device_id: {
    notEmpty: true,
    errorMessage: "Device id cannot be empty",
  },
};

/* phone_number_schema */
exports.phoneNumberSchema = {
  phone_number: validatePhone(),
};

/* email schema */
exports.emailSchema = {
  email: {
    notEmpty: true,
    errorMessage: "Email cannot be empty",
    isEmail: {
      bail: true,
      errorMessage: "Invalid email address",
    },
  },
};
