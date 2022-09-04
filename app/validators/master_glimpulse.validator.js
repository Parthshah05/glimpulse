const { validateUrl } = require("./common.validator");

exports.masterGlimpulseSchema = {
  public_id: {
    notEmpty: true,
    errorMessage: "Public id cannot be empty",
  },
  title: {
    notEmpty: true,
    errorMessage: "Name cannot be empty",
  },
//   url: validateUrl(),
  end_date: {
    notEmpty: false,
    custom: {
      options: (value, { req }) => {
        let start_date = req.body.start_date;
        if (start_date) {
          if (!value) {
            throw new Error("Please enter End_date");
          }
        }
        if (!value && !start_date) {
          return true;
        }
        if (!start_date) {
          throw new Error("Please enter Start_Date");
        }

        return true;
      },
    },
  },
};
