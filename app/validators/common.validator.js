const {
  REGEX_EMAIL,
  REGEX_PHONE_NUMBER,
  REGEX_PASSWORD,
  REGEX_URL,
} = require("../common/regex.common");

/* validate phone number */
exports.validatePhone = () => {
  return {
    notEmpty: false,
    // errorMessage: "Phone number cannot be empty",
    // custom: {
    //   options: (value, { req }) => {
    //     let email = req.body.email;
    //     if (value) {
    //       let regex = REGEX_PHONE_NUMBER;
    //       if (regex.exec(value) == null) {
    //         throw new Error("Invalid Phone Number");
    //       }
    //     }
    //     if (!email) {
    //       if (!value) {
    //         throw new Error("Phone number cannot be empty");
    //       }
    //     } else {
    //       let regex = REGEX_EMAIL;
    //       if (regex.exec(email) == null) {
    //         throw new Error("Invalid Email");
    //       }
    //     }
    //     return true;
    //   },
    // },
    // isMobilePhone: { errorMessage: "Invalid Phone Number" },
  };
};

/* validate password */
exports.validatePassword = () => {
  return {
    notEmpty: true,
    errorMessage: "Password cannot be empty",
    custom: {
      options: (value) => {
        let regex = REGEX_PASSWORD;
        if (regex.exec(value) == null) {
          throw new Error(
            "Password should be minimum 8 characters and one numeral"
          );
        }
        return true;
      },
    },
  };
};

/* validate website url */
exports.validateUrl = () => {
  return {
    notEmpty: false,
    custom: {
      options: (value) => {
        if (!value) {
          return true;
        }
        let regex = REGEX_URL;
        if (regex.exec(value) == null) {
          throw new Error("Invalid URL");
        }
        return true;
      },
    },
  };
};
