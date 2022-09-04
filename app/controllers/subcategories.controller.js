const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");
const subcategoryService = require("../services/subcategory.service");

/* for subcategory list */
exports.list = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const subcategories = await subcategoryService.allSubcategories(
        order_by,
        parseInt(order_type),
        req.query
      );
      return res.status(200).json(
        successResponse(constants.SUBCATEGORY_LIST, {
          total_subcategories: subcategories.length,
          subcategories: subcategories,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);

    let subcategory_list = await subcategoryService.subcategoryList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type),
      req.query
    );
    const total_subcategories =
      await subcategoryService.totalSubcategoryCount();
    const payload = {
      total_subcategories: total_subcategories,
      subcategories: subcategory_list,
    };
    res.status(200).json(successResponse(constants.SUBCATEGORY_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get all subcategory */
exports.getAll = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const subcategories = await subcategoryService.adminAllSubcategories(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.SUBCATEGORY_LIST, {
          total_subcategories: subcategories.length,
          subcategories: subcategories,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);
    let subcategory_list = await subcategoryService.adminSubcategoryList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_subcategories =
      await subcategoryService.adminTotalSubcategoryCount();
    const payload = {
      total_subcategories: total_subcategories,
      subcategories: subcategory_list,
    };
    res.status(200).json(successResponse(constants.SUBCATEGORY_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create  Subcategory */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_data = req.userData;
    if (user_data.id) {
      req_data.created_by = user_data.id;
    }
    if (req_data.title) {
      req_data.key = req_data.title.toLowerCase();
    }
    req_data.status = req_data.status ? req_data.status : true;

    let already_exist = await subcategoryService.getSubcategoryByName(
      req_data.title
    );
    if (already_exist) {
      return res
        .status(409)
        .json(errorResponse(constants.SUBCATEGORY_ALREADY_EXIST));
    }

    let subcategory_count = await subcategoryService.totalSubcategoryCount();
    req_data.sort_order = subcategory_count + 1;

    let created_subcategory = await subcategoryService.createNewSubcategory(
      req_data
    );

    let get_subcategory = await subcategoryService.getSubcategoryById(
      created_subcategory._id
    );

    let payload = await subcategoryService.setResponse(get_subcategory);

    if (created_subcategory) {
      res
        .status(200)
        .json(successResponse(constants.SUBCATEGORY_CREATE_SUCCESS, payload));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update subcategory */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    let subcategory_id = req.params.id;
    let updated_subcategory;
    let user_data = req.userData;

    if (user_data.id) {
      req_data.updated_by = user_data.id;
    }

    if (req_data.title) {
      req_data.key = req_data.title.toLowerCase();
    }

    let subcategory_by_id = await subcategoryService.getSubcategoryById(
      subcategory_id
    );

    if (!subcategory_by_id) {
      return res
        .status(404)
        .json(errorResponse(constants.SUBCATEGORY_NOT_FOUND));
    }

    let subcategory_by_name = await subcategoryService.getSubcategoryByName(
      req_data.title
    );

    if (!subcategory_by_name) {
      updated_subcategory = await subcategoryService.updateSubcategory(
        subcategory_id,
        req_data
      );
    } else if (
      subcategory_by_id._id &&
      subcategory_by_id.title == subcategory_by_name.title
    ) {
      updated_subcategory = await subcategoryService.updateSubcategory(
        subcategory_id,
        req_data
      );
    }

    let payload = await subcategoryService.setResponse(updated_subcategory);

    if (updated_subcategory) {
      return res
        .status(200)
        .json(successResponse(constants.SUBCATEGORY_UPDATE_SUCCESS, payload));
    }
    res.status(400).json(errorResponse(constants.SUBCATEGORY_ALREADY_EXIST));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get subcategory by id */
exports.getById = async (req, res, next) => {
  try {
    let subcategory_id = req.params.id;
    let subcategory = await subcategoryService.getSubcategoryById(
      subcategory_id
    );
    if (!subcategory) {
      return res
        .status(404)
        .json(errorResponse(constants.SUBCATEGORY_NOT_FOUND));
    }
    let payload = await subcategoryService.setResponse(subcategory);
    res.status(200).json(successResponse(constants.SUBCATEGORY_BY_ID, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete subcategory */
exports.delete = async (req, res, next) => {
  try {
    let subcategory_id = req.params.id;
    let subcategory = await subcategoryService.getSubcategoryById(
      subcategory_id
    );
    if (!subcategory) {
      return res
        .status(404)
        .json(errorResponse(constants.SUBCATEGORY_NOT_FOUND));
    }
    await subcategoryService.deleteSubcategory(subcategory_id);
    let payload = await subcategoryService.setResponse(subcategory);
    res
      .status(200)
      .json(successResponse(constants.SUBCATEGORY_DELETE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete multiple subcategory */
exports.deleteMany = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.subcategory_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.SUBCATEGORY_ID_CANT_BE_EMPTY));
    }
    await subcategoryService.deleteMultipleSubcategory(
      req_data.subcategory_ids
    );
    res.status(200).json(successResponse(constants.SUBCATEGORY_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
