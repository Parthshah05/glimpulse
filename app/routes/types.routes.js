const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const typeController = require("../controllers/types.controller");

router.get("/", authMiddleware.verifyToken, typeController.list);

module.exports = router;
