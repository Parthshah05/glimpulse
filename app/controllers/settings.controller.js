const settingService = require("../services/setting.service");
const { errorResponse, successResponse } = require("../common/response.common");

exports.getAll = async (req, res, next) => {
  try {
    let all_settings = await settingService.getAll();
    return res.status(200).json(
      successResponse("Setting List", {
        total_settings: all_settings.length,
        settings: all_settings,
      })
    );
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

exports.getById = async (req, res, next) => {
  try {
    const setting_id = req.params._id;
    const setting = await settingService.getById(setting_id);
    if (!setting) {
      return res.status(400).json(errorResponse("Setting not found!"));
    }
    res.status(200).json(successResponse("Setting by id", setting));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

exports.getByName = async (req, res, next) => {
  try {
    const setting_name = req.params.name;
    const setting = await settingService.getByName(setting_name);
    if (!setting) {
      return res.status(400).json(errorResponse("Setting not found!"));
    }
    res.status(200).json(successResponse("Setting by name", setting));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

exports.create = async (req, res, next) => {
  try {
    const req_data = req.body;
    const already_exist = await settingService.getByName(req_data.setting_name);
    if (already_exist) {
      return res.status(400).json(errorResponse("Setting name already exist!"));
    }
    const created_setting = await settingService.create(req_data);
    res
      .status(200)
      .json(successResponse("Setting created successfully", created_setting));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

exports.update = async (req, res, next) => {
  try {
    const req_data = req.body;
    const setting_id = req.params._id;
    const already_exist = await settingService.getById(setting_id);
    if (!already_exist) {
      return res.status(400).json(errorResponse("Setting not found!"));
    }
    const updated_setting = await settingService.update(setting_id, req_data);
    res
      .status(200)
      .json(successResponse("Setting updated successfully", updated_setting));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const setting_id = req.params._id;
    const already_exist = await settingService.getById(setting_id);
    if (!already_exist) {
      return res.status(400).json(errorResponse("Setting not found!"));
    }
    await settingService.delete(setting_id);
    res.status(200).json(successResponse("Setting deleted successfully"));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};
