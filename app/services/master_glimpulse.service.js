const MasterGlimpulse = require("../models/master_glimpulses.model");
const Category = require("../models/categories.model");
const mongoose = require("mongoose");
/* get master glimple list */
exports.getAllGlimpulse = async (
  page,
  per_page,
  order_by,
  order_type,
  req_query
) => {
  return MasterGlimpulse.find({
    is_deleted: false,
  })
    .limit(per_page)
    .skip(per_page * page)
    .sort({
      sort_order: order_type ? order_type : 1,
    })
    .select(
      "category_id subcategory_id, type_id name keywords publish_info audio artist url sort_order description public_id start_date end_date title status glimple_of_day created_at updated_at"
    )
    .populate("category_id", "name category_color sort_order keywords _id")
    .populate("subcategory_id")
    .populate("type_id");
};

/* all glimple without pagination */
exports.allGlimple = async (order_by, order_type, req_query) => {
  return MasterGlimpulse.aggregate([
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
    {
      $lookup: {
        from: "subcategories",
        localField: "subcategory_id",
        foreignField: "_id",
        as: "subcategory_id",
      },
    },
    {
      $lookup: {
        from: "types",
        localField: "type_id",
        foreignField: "_id",
        as: "type_id",
      },
    },
    {
      $project: {
        name: 1,
        public_id: 1,
        description: 1,
        artist: 1,
        url: 1,
        start_date: 1,
        end_date: 1,
        title: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
        glimple_of_day: 1,
        keywords: 1,
        publish_info: 1,
        sort_order: 1,
        audio: 1,
        "category_id._id": 1,
        "category_id.category_color": 1,
        "category_id.name": 1,
        "category_id.keywords": 1,
        subcategory_id: 1,
        type_id: 1,
      },
    },
  ]);
  //   return MasterGlimpulse.find({ is_deleted: false })
  //     .select("category_id name keywords artist description public_id")
  //     .sort({ [order_by]: order_type })
  //     .populate("category_id", "name category_color");
};

exports.getKeywordSearchGlimpulse = async (
  // page,
  // per_page,
  order_by,
  order_type,
  req_query
) => {
  var name_search = new RegExp(req_query.keyword, "i");
  return (
    MasterGlimpulse.find({
      category_id: { $in: [mongoose.Types.ObjectId(req_query.category_id)] },
      keywords: name_search,
      is_deleted: false,
    })
      // .limit(per_page)
      //  .skip(per_page * page)
      .sort({
        sort_order: order_type ? order_type : 1,
      })
      .select(
        "category_id name keywords subcategory_id type_id audio artist url publish_info sort_order description public_id start_date end_date title status glimple_of_day created_at updated_at"
      )
      .populate("category_id", "name category_color sort_order keywords _id")
      .populate("subcategory_id")
      .populate("type_id")
  );
};

exports.typeKeywordSearchGlimpulse = async (
  // page,
  // per_page,
  order_by,
  order_type,
  req_query
) => {
    let condition = {
      type_id: { $in: [mongoose.Types.ObjectId(req_query.type_id)] },
      is_deleted: false,
    }
    if(req_query.keyword) {
        let name_search = new RegExp(req_query.keyword, "i");
        condition.keywords = name_search
    }
  return (
    MasterGlimpulse.find(condition)
      // .limit(per_page)
      //  .skip(per_page * page)
      .sort({
        sort_order: order_type ? order_type : 1,
      })
      .select(
        "category_id name keywords subcategory_id type_id audio artist url publish_info sort_order description public_id start_date end_date title status glimple_of_day created_at updated_at"
      )
      .populate("category_id", "name category_color sort_order keywords _id")
      .populate("subcategory_id")
      .populate("type_id")
  );
};

/* total glimpulse count */
exports.totalGlimpulseCount = async () => {
  return MasterGlimpulse.count({ is_deleted: false });
};

/* get glimple by id */
exports.getGlimpulseById = async (glimple_id) => {
  return MasterGlimpulse.findOne({
    _id: glimple_id,
    is_deleted: false,
  })
    .select(
      "category_id name sort_order keywords artist url publish_info description audio public_id start_date end_date title status glimple_of_day type_id subcategory_id created_at updated_at"
    )
    .populate("category_id", "name category_color sort_order keywords _id")
    .populate("type_id")
    .populate("subcategory_id");
};

/* get glimple by user id */
exports.getUserGlimpulseByUserId = async (user_id) => {
  return MasterGlimpulse.findOne({
    created_by: user_id,
    is_deleted: false,
  })
    .select(
      "category_id name keywords artist url sort_order publish_info audio subcategory_id type_id description public_id start_date end_date title status glimple_of_day created_at updated_at"
    )
    .populate("category_id", "name category_color sort_order keywords _id")
    .populate("subcategory_id")
    .populate("type_id");
};

/* get glimple by field */
exports.getGlimpleByField = async (field_name, field_value) => {
  return MasterGlimpulse.findOne({
    [field_name]: field_value,
    is_deleted: false,
  })
    .select(
      "category_id name keywords artist url subcategory_id type_id publish_info audio description sort_order public_id start_date end_date title status glimple_of_day created_at updated_at"
    )
    .populate("category_id", "name category_color keywords _id")
    .populate("subcategory_id")
    .populate("type_id");
};

/* get glimple by start date and end date */
exports.getGlimpleByStartEndDate = async (start_date, end_date) => {
  return await MasterGlimpulse.find({
    $or: [
      {
        start_date: {
          $gte: start_date,
          $lte: end_date,
        },
      },
      {
        end_date: {
          $gte: start_date,
          $lte: end_date,
        },
      },
    ],
  });
};

/* get glimpulse by category */
exports.getGlimpulseByCategory = async (
  category_id,
  page,
  per_page,
  order_by,
  order_type
) => {
  return MasterGlimpulse.aggregate([
    {
      $match: {
        category_id: { $in: [mongoose.Types.ObjectId(category_id)] },
        is_deleted: false,
        status: "publish",
      },
    },
    {
      $sort: {
        sort_order: order_type ? order_type : 1,
      },
    },
    {
      $project: {
        keywords: 1,
        total_user_created_glimples: 1,
        status: 1,
        title: 1,
        public_id: 1,
        artist: 1,
        url: 1,
        description: 1,
        publish_info: 1,
        subcategory_id: 1,
        type_id: 1,
        audio: 1,
      },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(page) } },
        ],
        data: [{ $skip: per_page * page }, { $limit: per_page }],
      },
    },
  ]);
};

/* create new user glimple */
exports.creatNewGlimpulse = async (user_glimple) => {
  return MasterGlimpulse.create(user_glimple);
};

/* update master glimple */
exports.updateGlimpulse = async (glimple_id, user_glimple) => {
  return await MasterGlimpulse.findOneAndUpdate(
    { _id: glimple_id },
    { $set: user_glimple },
    { new: true }
  )
    .select(
      "category_id name keywords artist sort_order description publish_info url audio subcategory_id type_id public_id start_date end_date title status glimple_of_day created_at updated_at"
    )
    .populate("category_id", "name category_color sort_order keywords _id")
    .populate("subcategory_id")
    .populate("type_id");
};

/* increment total created glimpulse */
exports.increaseTotalCreatedGlimpulse = async (public_id) => {
  return await MasterGlimpulse.findOneAndUpdate(
    { public_id: public_id },
    { $inc: { total_user_created_glimples: 1 } }
  );
};

/* delete master glimple */
exports.deleteMasterGlimpulse = async (glimple_id) => {
  return MasterGlimpulse.deleteOne({ _id: glimple_id });
};

/* delete multiple master glimple */
exports.deleteMultipleMasterGlimpulse = async (glimple_ids) => {
  return MasterGlimpulse.deleteMany({ _id: glimple_ids });
};

/* set glimple of the day */
exports.setGlimpleOfTheDay = async (glimple_id) => {
  await MasterGlimpulse.updateMany({}, { $set: { glimple_of_day: false } });
  await MasterGlimpulse.findOneAndUpdate(
    { _id: glimple_id },
    { $set: { glimple_of_day: true } }
  );
  return true;
};

exports.getCollectionId = async () => {
  return await Category.findOne({ name: "Collections", is_deleted: false });
};

/* set response */
exports.setResponse = async (glimpulse) => {
  return await {
    _id: glimpulse._id,
  };
};

/* get by subcategory id */
exports.getBySubcategoryId = async (subcategory_id) => {
  return MasterGlimpulse.find({
    subcategory_id: { $in: [mongoose.Types.ObjectId(subcategory_id)] },
    is_deleted: false,
    status: "publish",
  });
};

/* get by type id */
exports.getByTypeId = async (type_id, page, per_page, order_type) => {
    return MasterGlimpulse.aggregate([
    {
      $match: {
        type_id: { $in: [mongoose.Types.ObjectId(type_id)] },
        is_deleted: false,
        status: "publish",
      },
    },
    {
      $sort: {
        sort_order: order_type ? order_type : 1,
      },
    },
    {
      $project: {
        keywords: 1,
        total_user_created_glimples: 1,
        status: 1,
        title: 1,
        public_id: 1,
        artist: 1,
        url: 1,
        description: 1,
        publish_info: 1,
        subcategory_id: 1,
        type_id: 1,
        audio: 1,
      },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(page) } },
        ],
        data: [{ $skip: per_page * page }, { $limit: per_page }],
      },
    },
  ]);
};

/* update sort order */
exports.updateSortOrder = async (glimple, index) => {
  return await MasterGlimpulse.findOneAndUpdate(
    { _id: glimple._id },
    { $set: { sort_order: index } }
  );
};
