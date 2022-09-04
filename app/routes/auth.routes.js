const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");

const authController = require("../controllers/auth.controller");
const { validate } = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  changePasswordSchema,
  resetPasswordSchema,
  registrationSchema,
  phoneNumberSchema,
  emailSchema,
  loginSchema,
  verifyOtpSchema,
} = require("../validators/user.validator");

router.get("/", authController.get);

/* auth */
router.post(
  "/signup",
  validate(checkSchema(registrationSchema)) /* validation */,
  authController.signUp
);
router.post("/login", validate(checkSchema(loginSchema)), authController.login);

/* phone number */
router.post(
  "/sendOtp",
  validate(checkSchema(phoneNumberSchema)) /* validation */,
  authController.sendOtp
);
router.post("/resendOtp", authController.resendOtp);
router.post(
  "/verifyOtp",
  validate(checkSchema(verifyOtpSchema)) /* validation */,
  authController.verifyOtp
);

/* email */
router.post(
  "/sendEmailOtp",
  validate(checkSchema(emailSchema)),
  authController.sendEmailOtp
);

router.post(
  "/verifyEmailOtp",
  validate(checkSchema(emailSchema)),
  authController.verifyEmailOtp
);

/* forgot password */
router.post(
  "/forgotPassword",
  validate(checkSchema(phoneNumberSchema)),
  authController.forgotPassword
);

/* reset password */
router.post(
  "/resetPassword",
  validate(checkSchema(resetPasswordSchema)),
  authController.resetPassword
);

/* change password */
router.post(
  "/changePassword",
  authMiddleware.verifyToken,
  validate(checkSchema(changePasswordSchema)),
  authController.changePassword
);

/* logout */
router.post("/logout", authMiddleware.verifyToken, authController.logout);

module.exports = router;
