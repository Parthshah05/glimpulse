const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");
const cloudinary = require("../services/cloudinary.service");
const fs = require("fs");

/* for Upload file */
exports.upload = async (req, res, next) => {
  try {
    const file = req.file;
    if (
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/mpeg" ||
      file.mimetype === "audio/ogg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      const { path } = req.file; // file becomes available in req at this point
      const fName = req.file.originalname.split(".")[0];
      cloudinary.uploader.upload(
        path,
        {
          resource_type: "raw",
          public_id: `${req.body.folder_name}/${req.body.title}`,
        },
        (err, uploaded_data) => {
          if (err) {
            return res
              .status(404)
              .json(errorResponse(constants.CLOUDINARY_ERROR));
          }
          fs.unlinkSync(path);
          return res
            .status(200)
            .json(successResponse(constants.CLOUDINARY_SUCCESS, uploaded_data));
        }
      );
    } else {
      return res.status(404).json(errorResponse(constants.UPLOAD_ERROR));
    }
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
