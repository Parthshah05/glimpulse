const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");
const typeService = require("../services/type.service");
const masterGlimpulseService = require("../services/master_glimpulse.service");

/* for type list */
exports.list = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const types = await typeService.allTypes(
        order_by,
        parseInt(order_type),
        req.query
      );
      return res.status(200).json(
        successResponse(constants.TYPE_LIST, {
          total_types: types.length,
          types: types,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);

    let type_list = await typeService.typeList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type),
      req.query
    );
    const total_types = await typeService.totalTypeCount();
    const payload = {
      total_types: total_types,
      types: type_list,
    };
    res.status(200).json(successResponse(constants.TYPE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get all type */
exports.getAll = async (req, res, next) => {
  try {
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;
    if (req.query.page == undefined && req.query.perPage == undefined) {
      const types = await typeService.adminAlltypes(
        order_by,
        parseInt(order_type)
      );
      return res.status(200).json(
        successResponse(constants.TYPE_LIST, {
          total_types: types.length,
          types: types,
        })
      );
    }
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);
    let type_list = await typeService.adminTypeList(
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type)
    );
    const total_types = await typeService.adminTotalTypeCount();
    const payload = {
      total_types: total_types,
      types: type_list,
    };
    res.status(200).json(successResponse(constants.TYPE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create  TYPE */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_data = req.userData;
    if (user_data.id) {
      req_data.created_by = user_data.id;
    }

    req_data.status = req_data.status ? req_data.status : true;
    if (!req_data.category_id) {
      const collection = await masterGlimpulseService.getCollectionId();
      req_data.category_id = collection._id;
    }

    let already_exist = await typeService.getTypeByName(req_data.title);
    if (already_exist) {
      return res.status(409).json(errorResponse(constants.TYPE_ALREADY_EXIST));
    }

    let type_count = await typeService.totalTypeCount();
    req_data.sort_order = type_count + 1;

    let created_type = await typeService.createNewType(req_data);

    let get_type = await typeService.getTypeById(created_type._id);

    let payload = await typeService.setResponse(get_type);

    if (created_type) {
      res
        .status(200)
        .json(successResponse(constants.TYPE_CREATE_SUCCESS, payload));
    }
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update type */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    let type_id = req.params.id;
    let updated_type;
    let user_data = req.userData;

    if (user_data.id) {
      req_data.updated_by = user_data.id;
    }

    let type_by_id = await typeService.getTypeById(type_id);

    if (!type_by_id) {
      return res.status(404).json(errorResponse(constants.TYPE_NOT_FOUND));
    }

    let type_by_name = await typeService.getTypeByName(req_data.title);

    if (!type_by_name) {
      updated_type = await typeService.updateType(type_id, req_data);
    } else if (type_by_id._id && type_by_id.title == type_by_name.title) {
      updated_type = await typeService.updateType(type_id, req_data);
    }

    let payload = await typeService.setResponse(updated_type);

    if (updated_type) {
      return res
        .status(200)
        .json(successResponse(constants.TYPE_UPDATE_SUCCESS, payload));
    }
    res.status(400).json(errorResponse(constants.TYPE_ALREADY_EXIST));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get type by id */
exports.getById = async (req, res, next) => {
  try {
    let type_id = req.params.id;
    let type = await typeService.getTypeById(type_id);
    if (!type) {
      return res.status(404).json(errorResponse(constants.TYPE_NOT_FOUND));
    }
    let payload = await typeService.setResponse(type);
    res.status(200).json(successResponse(constants.TYPE_BY_ID, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete type */
exports.delete = async (req, res, next) => {
  try {
    let type_id = req.params.id;
    let type = await typeService.getTypeById(type_id);
    if (!type) {
      return res.status(404).json(errorResponse(constants.TYPE_NOT_FOUND));
    }
    await typeService.deleteType(type_id);
    let payload = await typeService.setResponse(type);
    res
      .status(200)
      .json(successResponse(constants.TYPE_DELETE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete multiple type */
exports.deleteMany = async (req, res, next) => {
  try {
    let req_data = req.body;
    if (req_data.type_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.TYPE_ID_CANT_BE_EMPTY));
    }
    await typeService.deleteMultipleType(req_data.type_ids);
    res.status(200).json(successResponse(constants.TYPE_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
