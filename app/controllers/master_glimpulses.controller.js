const moment = require("moment");
const categoryService = require("../services/category.service");
const cloudinaryService = require("../services/cloudinary.service");
const settingService = require("../services/setting.service");
const masterGlimpulseService = require("../services/master_glimpulse.service");
const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");

/* for list of glimpulse */
exports.list = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;

    if (req.query.perPage == undefined && req.query.page == undefined) {
      const all_glimples = await masterGlimpulseService.allGlimple(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.GLIMPULSE_LIST, {
          total_glimpulses: all_glimples.length,
          glimpulses: all_glimples,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);

    const glimpulse_list = await masterGlimpulseService.getAllGlimpulse(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_glimpulse = await masterGlimpulseService.totalGlimpulseCount();
    const payload = {
      total_glimpulses: total_glimpulse,
      glimpulses: glimpulse_list,
    };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get all admin categories */
exports.getAll = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;

    if (req.query.perPage == undefined && req.query.page == undefined) {
      const all_glimples = await masterGlimpulseService.allGlimple(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.GLIMPULSE_LIST, {
          total_glimpulses: all_glimples.length,
          glimpulses: all_glimples,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);

    const glimpulse_list = await masterGlimpulseService.getAllGlimpulse(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_glimpulse = await masterGlimpulseService.totalGlimpulseCount();
    const payload = {
      total_glimpulses: total_glimpulse,
      glimpulses: glimpulse_list,
    };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create new glimpulse */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    const user_id = req.userData.id;
    req_data.created_by = user_id;
    const collection = await masterGlimpulseService.getCollectionId();
    const glimplecategory_id = req_data.category_id;
    const already_exist = await masterGlimpulseService.getGlimpleByField(
      "public_id" /* pass field name as string */,
      req_data.public_id
    );
    if (already_exist) {
      return res
        .status(400)
        .json(errorResponse(constants.GLIMPULSE_ALREADY_EXIST));
    }
    if (collection) {
      const collection_id = JSON.stringify(collection._id);
      const category_id = JSON.stringify(glimplecategory_id);
      const result = category_id.includes(collection_id);
      if (!result) {
        req_data.type_id = null;
        req_data.subcategory_id = null;
      }
    } else {
      req_data.type_id = null;
      req_data.subcategory_id = null;
    }

    const start_date = req_data.start_date
      ? new Date(req_data.start_date)
      : req_data.start_date;
    const end_date = req_data.end_date
      ? new Date(req_data.end_date)
      : req_data.end_date;
    if (start_date && end_date) {
      const start_end_date_glimpulses =
        await masterGlimpulseService.getGlimpleByStartEndDate(
          start_date,
          end_date
        );
      if (start_end_date_glimpulses.length > 0) {
        return res
          .status(400)
          .json(errorResponse(constants.GLIMPULSE_DATE_ALREADY_EXIST));
      }
    }
    const created_glimple = await masterGlimpulseService.creatNewGlimpulse(
      req_data
    );
    if (created_glimple) {
      const get_by_id = await masterGlimpulseService.getGlimpulseById(
        created_glimple._id
      );
      return res
        .status(200)
        .json(successResponse(constants.GLIMPULSE_CREATE_SUCCESS, get_by_id));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update glimpulse */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    const glimple_id = req.params.id;
    const user_data = req.userData;
    if (user_data.id) {
      req_data.updated_by = user_data.id;
      req_data.updated_at = new Date();
    }

    const already_exist = await masterGlimpulseService.getGlimpulseById(
      glimple_id
    );
    if (!already_exist) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }

    let check_dates = await checkGlimpleOfDayDate(req_data, already_exist);
    if (!check_dates) {
      const start_date = req_data.start_date
        ? new Date(req_data.start_date)
        : req_data.start_date;
      const end_date = req_data.end_date
        ? new Date(req_data.end_date)
        : req_data.end_date;
      if (start_date && end_date) {
        const start_end_date_glimpulses =
          await masterGlimpulseService.getGlimpleByStartEndDate(
            start_date,
            end_date
          );
        if (start_end_date_glimpulses.length > 0) {
          return res
            .status(400)
            .json(errorResponse(constants.GLIMPULSE_DATE_ALREADY_EXIST));
        }
      }
    }

    const updated_glimpulse = await masterGlimpulseService.updateGlimpulse(
      glimple_id,
      req_data
    );
    if (updated_glimpulse) {
      return res
        .status(200)
        .json(
          successResponse(constants.GLIMPULSE_UPDATE_SUCCESS, updated_glimpulse)
        );
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* category wise glimpulse */
exports.categoryWiseGlimpulse = async (req, res) => {
  try {
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = req.query.page ? req.query.page : 0;
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;

    const category_id = req.params.category_id;
    const category_exist = await categoryService.getCategoryById(category_id);
    if (!category_exist) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }
    const glimpulse_by_category =
      await masterGlimpulseService.getGlimpulseByCategory(
        category_id,
        parseInt(page),
        parseInt(per_page),
        order_by,
        parseInt(order_type)
      );

    res
      .status(200)
      .json(
        successResponse(constants.GLIMPULSE_BY_CATEGORY, glimpulse_by_category)
      );
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get glimpulse by id */
exports.getById = async (req, res, next) => {
  try {
    const glimple_id = await req.params.id;
    const glimpulse = await masterGlimpulseService.getGlimpulseById(glimple_id);
    if (!glimpulse) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    res.status(200).json(successResponse(constants.GLIMPULSE_BY_ID, glimpulse));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete glimpulse */
exports.delete = async (req, res, next) => {
  try {
    let glimple_id = req.params.id;
    const master_glimpulse = await masterGlimpulseService.getGlimpulseById(
      glimple_id
    );
    if (!master_glimpulse) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    if (master_glimpulse.public_id) {
      await cloudinaryService.uploader.destroy(master_glimpulse.public_id);
    }
    await masterGlimpulseService.deleteMasterGlimpulse(glimple_id);
    res
      .status(200)
      .json(
        successResponse(constants.GLIMPULSE_DELETE_SUCCESS, master_glimpulse)
      );
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete multiple glimpulse */
exports.deleteMany = async (req, res, next) => {
  try {
    let glimple_ids = req.body.glimple_ids;
    if (glimple_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.GLIMPULSE_ID_CANT_BE_EMPTY));
    }
    await masterGlimpulseService.deleteMultipleMasterGlimpulse(glimple_ids);
    res.status(200).json(successResponse(constants.GLIMPULSE_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get glimpulse of the day */

exports.getGlimpleOfTheDay = async (req, res) => {
  try {
    const format1 = "YYYY-MM-DD";
    const glimpulses = await masterGlimpulseService.getAllGlimpulse();
    const today = moment().format(format1);
    const index = glimpulses.findIndex((o) => {
      if (o.start_date && o.end_date) {
        const start_date = moment(o.start_date).format(format1);
        const end_date = moment(o.end_date).format(format1);
        return (
          moment(today).isSame(start_date) ||
          moment(today).isBetween(start_date, end_date, undefined, "[]")
        );
      }
    });

    let glimpulse = glimpulses[index];
    if (!glimpulse) {
      glimpulse = glimpulses[0];
    }
    await masterGlimpulseService.setGlimpleOfTheDay(glimpulse._id);
    res
      .status(200)
      .json(successResponse(constants.GLIMPLE_OF_THE_DAY, glimpulse));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

const checkGlimpleOfDayDate = async (req_data, glimple) => {
  const format1 = "YYYY-MM-DD";
  if (req_data.start_date && req_data.end_date) {
    let new_start_date = moment(new Date(req_data.start_date)).format(format1);
    let new_end_date = moment(new Date(req_data.end_date)).format(format1);
    // const today = moment().format(format1);
    if (glimple.start_date && glimple.end_date) {
      const start_date = moment(glimple.start_date).format(format1);
      const end_date = moment(glimple.end_date).format(format1);
      return (
        moment(start_date).isSame(new_start_date) ||
        moment(end_date).isSame(new_end_date) ||
        moment(start_date).isBetween(
          new_start_date,
          new_end_date,
          undefined,
          "[]"
        )
      );
    }
  }
};

exports.sortOrder = async (req, res, next) => {
  try {
    const glimpulses = req.body.glimpulses;
    let payload = {
      order_by: req.query.sortBy,
      order_type: parseInt(req.query.sortType),
      setting_name: req.query.name,
    };
    await settingService.findByNameAndUpdate(payload);
    glimpulses.forEach(async (glimple, index) => {
      await masterGlimpulseService.updateSortOrder(glimple, index);
    });
    return res.status(200).json(successResponse("Success"));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

exports.keywordSearchlist = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    //  const per_page = req.query.perPage ? req.query.perPage : 10;
    //  const page = Math.max(0, req.query.page);

    const glimpulse_list =
      await masterGlimpulseService.getKeywordSearchGlimpulse(
        //  parseInt(page),
        //  parseInt(per_page),
        order_by,
        parseInt(order_type),
        req.query
      );
    const payload = {
      total_glimpulses: glimpulse_list.length,
      glimpulses: glimpulse_list,
    };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get by subcategory */
exports.getBySubcategory = async (req, res) => {
  try {
    const glimpulses = await masterGlimpulseService.getBySubcategoryId(
      req.params.id
    );
    const payload = {
      total_glimpulses: glimpulses.length,
      glimpulses: glimpulses,
    };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get by type */
exports.getByType = async (req, res) => {
  try {
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = req.query.page ? req.query.page : 0;
    const order_type = req.query.orderType;
    const glimpulses = await masterGlimpulseService.getByTypeId(
      req.params.id,
      parseInt(page),
      parseInt(per_page),
      parseInt(order_type),
    );
    // const payload = {
    //   total_glimpulses: glimpulses.length,
    //   glimpulses: glimpulses,
    // };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, glimpulses));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* search */
exports.typeSearchList = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    //  const per_page = req.query.perPage ? req.query.perPage : 10;
    //  const page = Math.max(0, req.query.page);

    const glimpulse_list =
      await masterGlimpulseService.typeKeywordSearchGlimpulse(
        //  parseInt(page),
        //  parseInt(per_page),
        order_by,
        parseInt(order_type),
        req.query
      );
    const payload = {
      total_glimpulses: glimpulse_list.length,
      glimpulses: glimpulse_list,
    };
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};