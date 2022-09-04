exports.subcategorySchema = {
  title: {
    notEmpty: true,
    errorMessage: "Title cannot be empty",
  },
  category_id: {
    notEmpty: true,
    errorMessage: "Category Id cannot be empty",
  },
};
