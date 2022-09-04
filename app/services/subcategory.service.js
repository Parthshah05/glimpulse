const Subcategory = require("../models/subcategories.model");
// const mongoose = require("mongoose");

/* get Subcategory list */
exports.subcategoryList = async (page, per_page, order_by, order_type) => {
  let condition = { is_deleted: false, status: true };
  //   if (req_query.type_id) {
  //     condition.type_id = {
  //       $in: [new mongoose.Types.ObjectId(req_query.type_id)],
  //     };
  //   }
  return Subcategory.find(condition)
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .populate("category_id");
};

/* all Subcategory without pagination */
exports.allSubcategories = async (order_by, order_type, req_query) => {
  let match = { is_deleted: false, status: true };
  //   if (req_query.type_id) {
  //     match.type_id = { $in: [new mongoose.Types.ObjectId(req_query.type_id)] };
  //   }
  return Subcategory.aggregate([
    {
      $match: match,
    },
    {
      $sort: {
        sort_order: order_type ? order_type : 1,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category_id",
      },
    },
  ]);
};

/* get Subcategory list */
exports.adminSubcategoryList = async (page, per_page, order_by, order_type) => {
  return Subcategory.find({ is_deleted: false })
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .populate("category_id");
};

/* all Subcategory without pagination */
exports.adminAllSubcategories = async (order_by, order_type) => {
  return Subcategory.aggregate([
    {
      $match: { is_deleted: false },
    },
    {
      $sort: {
        sort_order: order_type ? order_type : 1,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category_id",
      },
    },
  ]);
};

/* total Subcategory count */
exports.totalSubcategoryCount = async () => {
  return Subcategory.count({ is_deleted: false, status: true });
};

/*  */
exports.adminTotalSubcategoryCount = async () => {
  return Subcategory.count({ is_deleted: false });
};
/* get Subcategory by it's name */
exports.getSubcategoryByName = async (subcategory_name) => {
  return Subcategory.findOne({
    title: subcategory_name,
    is_deleted: false,
  }).populate("category_id");
};

/* get Subcategory by it's Id */
exports.getSubcategoryById = async (subcategory_id) => {
  return Subcategory.findOne({
    _id: subcategory_id,
    is_deleted: false,
  }).populate("category_id");
};

/* create Subcategory */
exports.createNewSubcategory = async (subcategory) => {
  return await Subcategory.create(subcategory);
};

/* update Subcategory */
exports.updateSubcategory = async (subcategory_id, subcategory) => {
  return await Subcategory.findOneAndUpdate(
    {
      _id: subcategory_id,
    },
    { $set: subcategory },
    { new: true }
  ).populate("category_id");
};

/* delete subcategory */
exports.deleteSubcategory = async (subcategory_id) => {
  return Subcategory.deleteOne({ _id: subcategory_id });
};

/* delete multiple subcategory */
exports.deleteMultipleSubcategory = async (subcategory_ids) => {
  return Subcategory.deleteMany({ _id: subcategory_ids });
};

/* set response */
exports.setResponse = async (subcategory) => {
  return {
    _id: subcategory._id,
    title: subcategory.title,
    key: subcategory.key,
    sort_order: subcategory.sort_order,
    status: subcategory.status,
    category_id: subcategory.category_id,
  };
};
