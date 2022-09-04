const express = require("express");
const router = express.Router();

const masterGlimpulseController = require("../controllers/master_glimpulses.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.verifyToken, masterGlimpulseController.list);
router.get(
  "/type/:id",
  authMiddleware.verifyToken,
  masterGlimpulseController.getByType
);
router.get(
  "/subcategory/:id",
  authMiddleware.verifyToken,
  masterGlimpulseController.getBySubcategory
);
router.post(
  "/categories/:category_id",
  authMiddleware.verifyToken,
  masterGlimpulseController.categoryWiseGlimpulse
);

router.get(
  "/day",
  authMiddleware.verifyToken,
  masterGlimpulseController.getGlimpleOfTheDay
);
router.get(
  "/keyword",
  authMiddleware.verifyToken,
  masterGlimpulseController.keywordSearchlist
);
router.get(
  "/search/types",
  authMiddleware.verifyToken,
  masterGlimpulseController.typeSearchList
);

module.exports = router;
