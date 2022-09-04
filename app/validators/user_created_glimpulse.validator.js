exports.userCreatedGlimpulseSchema = {
  cover_id: {
    notEmpty: true,
    errorMessage: "Cover id cannot be empty",
  },
  status: {
    notEmpty: true,
    errorMessage: "Status cannot be empty",
  },
  category_id: {
    notEmpty: true,
    errorMessage: "Category id cannot be empty",
  },
};

exports.visitedGlimpulseSchema = {
  glimple_id: {
    notEmpty: true,
    errorMessage: "User created glimple id cannot be empty",
  },
};
