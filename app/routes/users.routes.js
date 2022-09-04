const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/users.controller");
const { validate } = require("../middlewares/validate.middleware");

const { registrationSchema } = require("../validators/user.validator");

router.get("/profile", authMiddleware.verifyToken, userController.getProfile);
router.post(
  "/update/profile",
  authMiddleware.verifyToken,
  userController.updateProfile
);
router.get("/", authMiddleware.verifyToken, userController.list);
router.post(
  "/",
  authMiddleware.verifyToken,
  validate(checkSchema(registrationSchema)) /* validation */,
  userController.create
);
router.get(
  "/visited/glimpulses",
  authMiddleware.verifyToken,
  userController.userVisitedGlimpulse
);
router.put("/:id", authMiddleware.verifyToken, userController.update);
router.get("/:id", authMiddleware.verifyToken, userController.getById);
router.delete("/remove", authMiddleware.verifyToken, userController.deleteMany);
router.delete("/:id", authMiddleware.verifyToken, userController.delete);
router.get("/visited/remove/:id", authMiddleware.verifyToken, userController.removeUserVisitedGlimpulse);
router.put("/visited/deleteMany", authMiddleware.verifyToken, userController.removeMultipleUserVisitedGlimpulse);



module.exports = router;
