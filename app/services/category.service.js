const Category = require("../models/categories.model");

/* get category list */
exports.categoryList = async (page, per_page, order_by, order_type) => {
  return Category.find({ is_deleted: false, status: true })
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .select("name keywords category_color sort_order status");
};

/* all category without pagination */
exports.allCategories = async (order_by, order_type) => {
  return Category.aggregate([
    {
      $match: { is_deleted: false, status: true },
    },
    {
      $sort: {
        sort_order: order_type  ? order_type : 1,
      },
    },
    {
      $project: {
        name: 1,
        keywords: 1,
        category_color: 1,
        sort_order: 1,
        status: 1,
      },
    },
  ]);
};

/* get category list */
exports.adminCategoryList = async (page, per_page, order_by, order_type) => {
  return Category.find({ is_deleted: false })
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .select("name keywords category_color sort_order status");
};

/* all category without pagination */
exports.adminAllCategories = async (order_by, order_type) => {
  return Category.aggregate([
    {
      $match: { is_deleted: false },
    },
    {
      $sort: {
        sort_order: order_type ? order_type : 1
      },
    },
    {
      $project: {
        name: 1,
        keywords: 1,
        category_color: 1,
        sort_order: 1,
        status: 1,
      },
    },
  ]);
};

/* total category count */
exports.totalCategoryCount = async () => {
  return Category.count({ is_deleted: false, status: true });
};

/*  */
exports.adminTotalCategoryCount = async () => {
  return Category.count({ is_deleted: false });
};
/* get category by it's name */
exports.getCategoryByName = async (category_name) => {
  return Category.findOne({ name: category_name, is_deleted: false }).select(
    "name keywords category_color sort_order status"
  );
};

/* get category by it's Id */
exports.getCategoryById = async (category_id) => {
  return Category.findOne({ _id: category_id, is_deleted: false }).select(
    "name keywords category_color sort_order status"
  );
};

/* create category */
exports.createNewCategory = async (category) => {
  return await Category.create(category);
};

/* update category */
exports.updateCategory = async (category_id, category) => {
  return await Category.findOneAndUpdate(
    {
      _id: category_id,
    },
    { $set: category },
    { new: true }
  );
};

/* delete category */
exports.deleteCategory = async (category_id) => {
  return Category.deleteOne({ _id: category_id });
};

/* delete multiple category */
exports.deleteMultipleCategory = async (category_ids) => {
  return Category.deleteMany({ _id: category_ids });
};

/* set response */
exports.setResponse = async (category) => {
  return {
    _id: category._id,
    name: category.name,
    category_color: category.category_color,
    key: category.key,
    keywords: category.keywords,
    sort_order: category.sort_order,
    status: category.status,
  };
};
