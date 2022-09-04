const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/categories.controller");

router.get("/", authMiddleware.verifyToken, categoryController.list);

module.exports = router;
