const Type = require("../models/types.model");
const mongoose = require("mongoose");

/* get type list */
exports.typeList = async (page, per_page, order_by, order_type, req_query) => {
  let condition = { is_deleted: false, status: true };
  if (req_query.subcategory_id) {
    condition.subcategory_id = {
      $in: [new mongoose.Types.ObjectId(req_query.subcategory_id)],
    };
  }
  return Type.find(condition)
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .populate("subcategory_id");
};

/* all type without pagination */
exports.allTypes = async (order_by, order_type, req_query) => {
  let match = { is_deleted: false, status: true };
  if (req_query.subcategory_id) {
    match.subcategory_id = {
      $in: [new mongoose.Types.ObjectId(req_query.subcategory_id)],
    };
  }
  return Type.aggregate([
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
        from: "subcategories",
        localField: "subcategory_id",
        foreignField: "_id",
        as: "subcategory_id",
      },
    },
  ]);
};

/* get type list */
exports.adminTypeList = async (page, per_page, order_by, order_type) => {
  return Type.find({ is_deleted: false })
    .limit(per_page)
    .skip(per_page * page)
    .sort({ sort_order: order_type ? order_type : 1 })
    .populate("subcategory_id");
};

/* all type without pagination */
exports.adminAlltypes = async (order_by, order_type) => {
  return Type.aggregate([
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
        from: "subcategories",
        localField: "subcategory_id",
        foreignField: "_id",
        as: "subcategory_id",
      },
    },
  ]);
};

/* total type count */
exports.totalTypeCount = async () => {
  return Type.count({ is_deleted: false, status: true });
};

/*  */
exports.adminTotalTypeCount = async () => {
  return Type.count({ is_deleted: false });
};
/* get type by it's name */
exports.getTypeByName = async (type_name) => {
  return Type.findOne({ title: type_name, is_deleted: false }).populate(
    "subcategory_id"
  );
};

/* get type by it's Id */
exports.getTypeById = async (type_id) => {
  return Type.findOne({ _id: type_id, is_deleted: false }).populate(
    "subcategory_id"
  );
};

/* create type */
exports.createNewType = async (type) => {
  return await Type.create(type);
};

/* update type */
exports.updateType = async (type_id, type) => {
  return await Type.findOneAndUpdate(
    {
      _id: type_id,
    },
    { $set: type },
    { new: true }
  ).populate("subcategory_id");
};

/* delete type */
exports.deleteType = async (type_id) => {
  return Type.deleteOne({ _id: type_id });
};

/* delete multiple type */
exports.deleteMultipleType = async (type_ids) => {
  return Type.deleteMany({ _id: type_ids });
};

/* set response */
exports.setResponse = async (type) => {
  return {
    _id: type._id,
    title: type.title,
    sort_order: type.sort_order,
    status: type.status,
    key: type.key,
    subcategory_id: type.subcategory_id,
    // category_id: type.category_id,
    image: type.image,
  };
};
