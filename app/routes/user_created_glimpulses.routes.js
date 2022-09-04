const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");

const userCreatedGlimpulseController = require("../controllers/user_created_glimpulses.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  userCreatedGlimpulseSchema,
  visitedGlimpulseSchema,
} = require("../validators/user_created_glimpulse.validator.js");

router.get(
  "/:glimple_id/visited",
  //   authMiddleware.verifyToken,
  validate(checkSchema(visitedGlimpulseSchema)),
  userCreatedGlimpulseController.visitedGlimpulse
);

router.get(
  "/",
  authMiddleware.verifyToken,
  userCreatedGlimpulseController.list
);
router.post(
  "/",
  authMiddleware.verifyToken,
  validate(checkSchema(userCreatedGlimpulseSchema)),
  userCreatedGlimpulseController.create
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  validate(checkSchema(userCreatedGlimpulseSchema)),
  userCreatedGlimpulseController.update
);
router.get(
  "/statuses/:status",
  authMiddleware.verifyToken,
  userCreatedGlimpulseController.statusWise
);
router.patch(
  "/:glimple_id/visited",
  //   authMiddleware.verifyToken,
  validate(checkSchema(visitedGlimpulseSchema)),
  userCreatedGlimpulseController.visitedGlimpulse
);
router.get(
  "/:id",
  //   authMiddleware.verifyToken,
  userCreatedGlimpulseController.getById
);
router.get("/uuid/:id", userCreatedGlimpulseController.getByUUID);
router.delete(
  "/remove",
  authMiddleware.verifyToken,
  userCreatedGlimpulseController.deleteMany
);
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  userCreatedGlimpulseController.delete
);
router.get(
  "/changestatus/:id",
  authMiddleware.verifyToken,
  userCreatedGlimpulseController.changeDeleteStatus
);

module.exports = router;
