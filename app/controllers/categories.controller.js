const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");
const categoryService = require("../services/category.service");

/* for category list */
exports.list = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const categories = await categoryService.allCategories(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.CATEGORY_LIST, {
          total_categories: categories.length,
          categories: categories,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);

    let category_list = await categoryService.categoryList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_categories = await categoryService.totalCategoryCount();
    const payload = {
      total_categories: total_categories,
      categories: category_list,
    };
    res.status(200).json(successResponse(constants.CATEGORY_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get all category */
exports.getAll = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const categories = await categoryService.adminAllCategories(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.CATEGORY_LIST, {
          total_categories: categories.length,
          categories: categories,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);
    let category_list = await categoryService.adminCategoryList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_categories = await categoryService.adminTotalCategoryCount();
    const payload = {
      total_categories: total_categories,
      categories: category_list,
    };
    res.status(200).json(successResponse(constants.CATEGORY_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create  category */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_data = req.userData;
    if (user_data.id) {
      req_data.created_by = user_data.id;
    }
    if (req_data.name) {
      req_data.key = req_data.name.toLowerCase();
    }
    req_data.status = req_data.status ? req_data.status : true;

    let already_exist = await categoryService.getCategoryByName(req_data.name);
    if (already_exist) {
      return res
        .status(409)
        .json(errorResponse(constants.CATEGORY_ALREADY_EXIST));
    }

    let category_count = await categoryService.totalCategoryCount();
    req_data.sort_order = category_count + 1;

    let created_category = await categoryService.createNewCategory(req_data);

    let payload = await categoryService.setResponse(created_category);

    if (created_category) {
      res
        .status(200)
        .json(successResponse(constants.CATEGORY_CREATE_SUCCESS, payload));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update category */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    let category_id = req.params.id;
    let updated_category;
    let user_data = req.userData;

    if (user_data.id) {
      req_data.updated_by = user_data.id;
    }

    if (req_data.name) {
      req_data.key = req_data.name.toLowerCase();
    }

    let category_by_id = await categoryService.getCategoryById(category_id);

    if (!category_by_id) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }

    let category_by_name = await categoryService.getCategoryByName(
      req_data.name
    );

    if (!category_by_name) {
      updated_category = await categoryService.updateCategory(
        category_id,
        req_data
      );
    } else if (
      category_by_id._id &&
      category_by_id.name == category_by_name.name
    ) {
      updated_category = await categoryService.updateCategory(
        category_id,
        req_data
      );
    }

    let payload = await categoryService.setResponse(updated_category);

    if (updated_category) {
      return res
        .status(200)
        .json(successResponse(constants.CATEGORY_UPDATE_SUCCESS, payload));
    }
    res.status(400).json(errorResponse(constants.CATEGORY_ALREADY_EXIST));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get category by id */
exports.getById = async (req, res, next) => {
  try {
    let category_id = req.params.id;
    let category = await categoryService.getCategoryById(category_id);
    if (!category) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }
    let payload = await categoryService.setResponse(category);
    res.status(200).json(successResponse(constants.CATEGORY_BY_ID, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete category */
exports.delete = async (req, res, next) => {
  try {
    let category_id = req.params.id;
    let category = await categoryService.getCategoryById(category_id);
    if (!category) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }
    await categoryService.deleteCategory(category_id);
    let payload = await categoryService.setResponse(category);
    res
      .status(200)
      .json(successResponse(constants.CATEGORY_DELETE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete multiple category */
exports.deleteMany = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.category_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.CATEGORY_ID_CANT_BE_EMPTY));
    }
    await categoryService.deleteMultipleCategory(req_data.category_ids);
    res.status(200).json(successResponse(constants.CATEGORY_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
