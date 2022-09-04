const jwt = require("jsonwebtoken");

/* common */
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const { errorResponse, successResponse } = require("../common/response.common");
const constants = require("../common/constants.common");

/* services */
const userService = require("../services/user.service");
const fileService = require("../services/file.service");
const categoryService = require("../services/category.service");
const masterGlimpulseService = require("../services/master_glimpulse.service");
const userCreatedGlimpulseService = require("../services/user_created_glimpulse.service");
const cloudinaryService = require("../services/cloudinary.service");

/* for get list of user created glimpulse */
exports.list = async (req, res, next) => {
  try {
    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = Math.max(0, req.query.page);
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;

    let user_glimpulse_list =
      await userCreatedGlimpulseService.getUserCreatedGlimpulseList(
        parseInt(page),
        parseInt(per_page),
        order_by,
        parseInt(order_type)
      );
    const total_user_glimpulse =
      await userCreatedGlimpulseService.totalUserCreatedGlimpulseCount();
    const payload = {
      total_user_glimpulses: total_user_glimpulse,
      user_glimpulses: user_glimpulse_list,
    };
    res
      .status(200)
      .json(successResponse(constants.USER_CREATED_GLIMPULSE_LIST, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for create user created glimpulse */
exports.create = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_data = req.userData;
    if (user_data.id) {
      req_data.created_by = user_data.id;
    }
    if (req_data.status == "P") {
      req_data.published_date = new Date();
    }

    let category_exist = await categoryService.getCategoryById(
      req_data.category_id
    );
    if (!category_exist) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }

    let created_user_glimpulse =
      await userCreatedGlimpulseService.createNewUserGlimpulse(req_data);
    if (created_user_glimpulse) {
      await userService.increaseTotalCreatedUserGlimpulse(user_data.id);
      await masterGlimpulseService.increaseTotalCreatedGlimpulse(
        req_data.cover_id
      );
    }
    readFileAndReplace(req_data, created_user_glimpulse);

    let payload = await userCreatedGlimpulseService.setResponse(
      created_user_glimpulse
    );

    res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_CREATE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for update user created glimpulse */
exports.update = async (req, res, next) => {
  try {
    let req_data = req.body;
    let user_data = req.userData;
    let glimple_id = req.params.id;
    if (user_data.id) {
      req_data.updated_by = user_data.id;
    }

    let category_exist = await categoryService.getCategoryById(
      req_data.category_id
    );
    if (!category_exist) {
      return res.status(404).json(errorResponse(constants.CATEGORY_NOT_FOUND));
    }
    let master_glimple = await masterGlimpulseService.getGlimpleByField(
      "public_id",
      req_data.cover_id
    );
    // if (!req_data.text) {
    //   if (master_glimple && master_glimple.description) {
    //     req_data.text = master_glimple.description;
    //   } else {
    //     req_data.text = req_data.cover_id.split("_").join(" ");
    //   }
    // }
    let glimple = await userCreatedGlimpulseService.getUserGlimplseById(
      glimple_id
    );

    if (
      req_data.photo_id &&
      glimple.photo_id &&
      glimple.photo_id !== req_data.photo_id
    ) {
      await cloudinaryService.uploader.destroy(glimple.photo_id);
    }
    if (
      req_data.text_image_id &&
      glimple.text_image_id &&
      glimple.text_image_id !== req_data.text_image_id
    ) {
      await cloudinaryService.uploader.destroy(glimple.text_image_id);
    }
    if (!glimple) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    if (req_data.status == "P") {
      req_data.published_date = new Date();
      readFileAndReplace(req_data, glimple);
      req_data.url = process.env.AWS_URL + glimple.uuid;
    }
    let updated_user_glimpulse =
      await userCreatedGlimpulseService.updateUserGlimpulse(
        glimple_id,
        req_data
      );

    let payload = await userCreatedGlimpulseService.setResponse(
      updated_user_glimpulse
    );

    res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_UPDATE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* status wise user created glimpulse */
exports.statusWise = async (req, res) => {
  try {
    const status = req.params.status;
    let user_data = req.userData;
    let user_id = user_data.id;

    const per_page = req.query.perPage ? req.query.perPage : 10;
    const page = req.query.page ? req.query.page : 0;
    const order_by = req.query.orderBy;
    const order_type = req.query.orderType;

    const glimple = await userCreatedGlimpulseService.getGlimpleByStatus(
      status,
      parseInt(page),
      parseInt(per_page),
      order_by,
      parseInt(order_type),
      user_id
    );
    return res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_BY_STATUS, glimple));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* visited glimpulse and its count */
exports.visitedGlimpulse = async (req, res) => {
  try {
    let req_data = req.params;
    let token = req.headers.authorization;
    const is_user_glimpulse =
      await userCreatedGlimpulseService.getUserGlimplseById(
        req_data.glimple_id
      );
    if (!is_user_glimpulse) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    if (is_user_glimpulse.status == "P") {
      if (token) {
        let decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        const user_data = decoded;

        if (user_data.id) {
          if (
            is_user_glimpulse.created_by &&
            !is_user_glimpulse.created_by._id.equals(user_data.id)
          ) {
            req_data.user_id = user_data.id;
            await userService.addIntoUserVisitedGlimpulse(req_data);
          }
        }
      }
      await userCreatedGlimpulseService.increaseVisitCount(req_data);
      return res
        .status(200)
        .json(successResponse(constants.GLIMPULSE_IS_VISITED));
    }
    res.status(400).json(errorResponse(constants.GLIMPULSE_IS_NOT_PUBLISHED));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for get user by id */
exports.getById = async (req, res, next) => {
  try {
    let glimple_id = req.params.id;

    let glimple = await userCreatedGlimpulseService.getUserGlimplseById(
      glimple_id
    );
    if (!glimple) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }

    let payload = await userCreatedGlimpulseService.setResponse(glimple);

    res.status(200).json(successResponse(constants.GLIMPULSE_BY_ID, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete user created glimpulse */
exports.delete = async (req, res, next) => {
  try {
    let glimple_id = req.params.id;
    let user_created_glimpulse =
      await userCreatedGlimpulseService.getUserGlimplseById(glimple_id);
    if (!user_created_glimpulse) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    await userCreatedGlimpulseService.deleteUserCreatedGlimpulse(glimple_id);

    let payload = await userCreatedGlimpulseService.setResponse(
      user_created_glimpulse
    );

    res
      .status(200)
      .json(successResponse(constants.GLIMPULSE_DELETE_SUCCESS, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* for delete multiple user created glimpulse */
exports.deleteMany = async (req, res, next) => {
  try {
    let glimple_ids = req.body.glimple_ids;
    if (glimple_ids.length < 1) {
      return res
        .status(400)
        .json(errorResponse(constants.GLIMPULSE_ID_CANT_BE_EMPTY));
    }
    await userCreatedGlimpulseService.deleteMultipleUserCreatedGlimpulse(
      glimple_ids
    );
    res.status(200).json(successResponse(constants.GLIMPULSE_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
/* for delete user created glimpulse of Draft Status */
exports.changeDeleteStatus = async (req, res, next) => {
  try {
    let glimple_id = req.params.id;
    let user_created_glimpulse =
      await userCreatedGlimpulseService.getUserGlimplseById(glimple_id);
    if (!user_created_glimpulse) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }
    if (user_created_glimpulse.status === "P") {
      return res
        .status(404)
        .json(errorResponse(constants.GLIMPULSE_NOT_DELETED));
    }
    await userCreatedGlimpulseService.updateStatus(glimple_id);
    res.status(200).json(successResponse(constants.GLIMPULSE_DELETE_SUCCESS));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

/* get by uuid */
exports.getByUUID = async (req, res) => {
  try {
    let glimple_id = req.params.id;

    let glimple = await userCreatedGlimpulseService.getGlimpleByField(
      "uuid",
      glimple_id
    );
    if (!glimple) {
      return res.status(404).json(errorResponse(constants.GLIMPULSE_NOT_FOUND));
    }

    let payload = await userCreatedGlimpulseService.setResponse(glimple);

    res.status(200).json(successResponse(constants.GLIMPULSE_BY_ID, payload));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};

const readFileAndReplace = (req_data, glimple_data) => {
  let glimple_uuid = glimple_data.uuid;
  let newHtmlData;
  fs.copyFile(
    "public/index.html",
    `public/files/${glimple_uuid}.html`,
    function (err) {
      if (err) throw err;
      fs.readFile(
        `public/files/${glimple_uuid}.html`,
        "utf8",
        function (rerr, data) {
          if (rerr) throw rerr;
          if (data) {
            if (req_data.cover_id) {
              newHtmlData = setCoverUrls(data, req_data);
            }
            // if (req_data.text) {
            //   newHtmlData = setTextUrls(newHtmlData, req_data);
            // }
            if (req_data.photo_id) {
              newHtmlData = setPhotoUrl(newHtmlData, req_data);
            } else {
              newHtmlData = newHtmlData.replace(
                /<img[^>]*id="image_2"[^>]*>/,
                ""
              );
            }
            if (req_data.text_image_id) {
              newHtmlData = setTextImageUrl(newHtmlData, req_data);
            } else {
              newHtmlData = newHtmlData.replace(
                /<img[^>]*id="image_3"[^>]*>/,
                ""
              );
            }
            if (req_data.user_image_id) {
              newHtmlData = setProfilePictureUrl(newHtmlData, req_data);
            }
            if (glimple_data._id) {
              newHtmlData = newHtmlData.replace(
                /<input[^>]*id="visit_url"[^>]*>/,
                `<input type="hidden" id="visit_url" value="${process.env.API_URL}/api/users/glimpulses/${glimple_data._id}/visited">`
              );
              newHtmlData = newHtmlData.replace(
                /<input[^>]*id="ios_deep_link"[^>]*>/,
                `<input type="hidden" id="ios_deep_link" value="${process.env.DEEP_LINK_IOS_URL}?id=${glimple_data._id}">`
              );
            }
            /* write file */
            fs.writeFile(
              `public/files/${glimple_uuid}.html`,
              newHtmlData,
              "utf8",
              function (werr) {
                if (werr) throw werr;
                /* once publish upload into aws s3 bucket */
                if (req_data.status == "P") {
                  if (newHtmlData) {
                    const params = {
                      Bucket: "glim.pl", // pass your bucket name
                      ContentType: "text/html",
                      Key: `${glimple_uuid}`, // file will be saved as uuid
                      Body: newHtmlData,
                    };
                    s3.upload(params, function (s3Err, s3Data) {
                      if (s3Err) throw s3Err;
                      // console.log(`File uploaded successfully at ${s3Data.Location}`);
                      if (s3Data.Location) {
                        fs.unlinkSync(`public/files/${glimple_data.uuid}.html`);
                      }
                    });
                  }
                }
              }
            );
          }
        }
      );
    }
  );
  return true;
};

const setCoverUrls = (data, req_data) => {
  let newHtmlData;

  newHtmlData = data.replace(
    /<img[^>]*id="image_1"[^>]*>/,
    `<img alt="" id="image_1" src="${process.env.CLOUDINARY_API_URL}/image/upload/h_640,w_640,c_fill,r_max,g_center/${process.env.CLOUDINARY_FOLDER_PATH}${req_data.cover_id}.png"/>`
  );
  newHtmlData = newHtmlData.replace(
    /<meta[^>]*property="og:image"[^>]*>/,
    `<meta property="og:image"  itemprop="image" content="${process.env.CLOUDINARY_API_URL}/image/upload/h_640,w_640,c_fill,r_max,g_center/${process.env.CLOUDINARY_FOLDER_PATH}${req_data.cover_id}.png"/>`
  );

  newHtmlData = newHtmlData.replace(
    /<meta[^>]*property="og:image:secure_url"[^>]*>/,
    `<meta property="og:image:secure_url"  itemprop="image" content="${process.env.CLOUDINARY_API_URL}/image/upload/h_640,w_640,c_fill,r_max,g_center/${process.env.CLOUDINARY_FOLDER_PATH}${req_data.cover_id}.png"/>`
  );
  newHtmlData = newHtmlData.replace(
    /<meta[^>]*name="twitter:image"[^>]*>/,
    `<meta name="twitter:image" content="${process.env.CLOUDINARY_API_URL}/image/upload/h_640,w_640,c_fill,r_max,g_center/${process.env.CLOUDINARY_FOLDER_PATH}${req_data.cover_id}.png"/>`
  );
  newHtmlData = newHtmlData.replace(
    /<link[^>]*itemprop="thumbnailUrl"[^>]*>/,
    `<link itemprop="thumbnailUrl" href="${process.env.CLOUDINARY_API_URL}/image/upload/h_640,w_640,c_fill,r_max,g_center/${process.env.CLOUDINARY_USER_CREATED_FOLDER_PATH}${req_data.cover_id}.png"/>`
  );

  return newHtmlData;
};

const setTextUrls = (newHtmlData, req_data) => {
  newHtmlData = newHtmlData.replace(
    /<meta[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${req_data.text}" />`
  );
  newHtmlData = newHtmlData.replace(
    /<meta[^>]*name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${req_data.text}" />`
  );
  return newHtmlData;
};

const setPhotoUrl = (newHtmlData, req_data) => {
  newHtmlData = newHtmlData.replace(
    /<img[^>]*id="image_2"[^>]*>/,
    `<img alt="" id="image_2" src="${process.env.CLOUDINARY_API_URL}/image/upload/h_960,w_960,c_fill,r_max,g_center/${process.env.CLOUDINARY_USER_CREATED_FOLDER_PATH}${req_data.photo_id}.png"/>`
  );
  return newHtmlData;
};

const setTextImageUrl = (newHtmlData, req_data) => {
  newHtmlData = newHtmlData.replace(
    /<img[^>]*id="image_3"[^>]*>/,
    `<img alt="" id="image_3" src="${process.env.CLOUDINARY_API_URL}/image/upload/h_960,w_960,c_fill,r_max,g_center/${process.env.CLOUDINARY_USER_CREATED_FOLDER_PATH}${req_data.text_image_id}.png"/>`
  );
  return newHtmlData;
};
const setProfilePictureUrl = (newHtmlData, req_data) => {
  newHtmlData = newHtmlData.replace(
    /<img[^>]*id="image_4"[^>]*>/,
    `<img alt="" id="image_4" src="${process.env.CLOUDINARY_API_URL}/image/upload/h_960,w_960,c_fill,r_max,g_center/${process.env.CLOUDINARY_USER_CREATED_FOLDER_PATH}${req_data.user_image_id}.png"/>`
  );
  return newHtmlData;
};
