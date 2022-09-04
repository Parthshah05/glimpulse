const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const cloudinaryController = require("../controllers/cloudinary.controller");
const upload = require("../common/multer.common");

router.post(
  "/",
  authMiddleware.verifyToken,
  upload,
  cloudinaryController.upload
);

module.exports = router;
