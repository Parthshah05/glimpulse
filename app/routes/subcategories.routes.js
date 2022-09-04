const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const subcategoryController = require("../controllers/subcategories.controller");

router.get("/", authMiddleware.verifyToken, subcategoryController.list);

module.exports = router;
