const Setting = require("../models/settings.model");

/* get all settings */
exports.getAll = async () => {
  return await Setting.find({});
};

/* get By name */
exports.getByName = async (name) => {
  return await Setting.findOne({ setting_name: name });
};

/* get By id */
exports.getById = async (id) => {
  return await Setting.findOne({ _id: id });
};
/* create new setting */
exports.create = async (req_data) => {
  return await Setting.create(req_data);
};

/* update setting */
exports.update = async (id, req_data) => {
  return await Setting.findOneAndUpdate(
    { _id: id },
    { $set: req_data },
    { new: true }
  );
};

/* delete setting */
exports.delete = async (id) => {
  return await Setting.deleteOne({ _id: id });
};

/* update by name */
exports.findByNameAndUpdate = async (payload) => {
  return await Setting.findOneAndUpdate(
    { setting_name: payload.setting_name },
    { $set: payload }
  );
};
