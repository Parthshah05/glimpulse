const { validateUrl } = require("./common.validator");

exports.categorySchema = {
  name: {
    notEmpty: true,
    errorMessage: "Name cannot be empty",
  },
  category_color: {
    notEmpty: true,
    errorMessage: "Category color cannot be empty",
  },
  url: validateUrl(),
};
