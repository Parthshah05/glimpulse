const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/categories.controller");
const subcategoryController = require("../controllers/subcategories.controller");
const typeController = require("../controllers/types.controller");
const glimpulseController = require("../controllers/master_glimpulses.controller");
const authController = require("../controllers/auth.controller");
const settingController = require("../controllers/settings.controller");
const { validate } = require("../middlewares/validate.middleware");
const { categorySchema } = require("../validators/category.validator");
const { subcategorySchema } = require("../validators/subcategory.validator");
const { typeSchema } = require("../validators/types.validator");
const {
  masterGlimpulseSchema,
} = require("../validators/master_glimpulse.validator");
const { loginSchema } = require("../validators/user.validator");

/* login */
router.post("/login", validate(checkSchema(loginSchema)), authController.login);

/* glimpulse */
let glimpleRoute = "/glimpulses";
router.get(
  `${glimpleRoute}`,
  authMiddleware.verifyToken,
  glimpulseController.getAll
);
router.post(
  `${glimpleRoute}`,
  authMiddleware.verifyToken,
  validate(checkSchema(masterGlimpulseSchema)),
  glimpulseController.create
);
router.put(
  `${glimpleRoute}/:id`,
  authMiddleware.verifyToken,
  validate(checkSchema(masterGlimpulseSchema)),
  glimpulseController.update
);
router.patch(`${glimpleRoute}/sort`, glimpulseController.sortOrder);
router.get(
  `${glimpleRoute}/:id`,
  authMiddleware.verifyToken,
  glimpulseController.getById
);
router.delete(
  `${glimpleRoute}/remove`,
  authMiddleware.verifyToken,
  glimpulseController.deleteMany
);
router.delete(
  `${glimpleRoute}/:id`,
  authMiddleware.verifyToken,
  glimpulseController.delete
);

/* categories */
let categoryRoute = "/categories";
router.get(
  `${categoryRoute}`,
  authMiddleware.verifyToken,
  categoryController.getAll
);
router.post(
  `${categoryRoute}`,
  authMiddleware.verifyToken,
  validate(checkSchema(categorySchema)),
  categoryController.create
);
router.put(
  `${categoryRoute}/:id`,
  authMiddleware.verifyToken,
  categoryController.update
);
router.get(
  `${categoryRoute}/:id`,
  authMiddleware.verifyToken,
  categoryController.getById
);
/* remove multiple category */
router.delete(
  `${categoryRoute}/remove`,
  authMiddleware.verifyToken,
  categoryController.deleteMany
);
router.delete(
  `${categoryRoute}/:id`,
  authMiddleware.verifyToken,
  categoryController.delete
);

/* sub categories */
let subcategoryRoute = "/subcategories";
router.get(
  `${subcategoryRoute}`,
  authMiddleware.verifyToken,
  subcategoryController.getAll
);
router.post(
  `${subcategoryRoute}`,
  authMiddleware.verifyToken,
  validate(checkSchema(subcategorySchema)),
  subcategoryController.create
);
router.put(
  `${subcategoryRoute}/:id`,
  authMiddleware.verifyToken,
  subcategoryController.update
);
router.get(
  `${subcategoryRoute}/:id`,
  authMiddleware.verifyToken,
  subcategoryController.getById
);
/* remove multiple category */
router.delete(
  `${subcategoryRoute}/remove`,
  authMiddleware.verifyToken,
  subcategoryController.deleteMany
);
router.delete(
  `${subcategoryRoute}/:id`,
  authMiddleware.verifyToken,
  subcategoryController.delete
);

/* Types */
let typeRoute = "/types";
router.get(`${typeRoute}`, authMiddleware.verifyToken, typeController.getAll);
router.post(
  `${typeRoute}`,
  authMiddleware.verifyToken,
  validate(checkSchema(typeSchema)),
  typeController.create
);
router.put(
  `${typeRoute}/:id`,
  authMiddleware.verifyToken,
  typeController.update
);
router.get(
  `${typeRoute}/:id`,
  authMiddleware.verifyToken,
  typeController.getById
);
/* remove multiple category */
router.delete(
  `${typeRoute}/remove`,
  authMiddleware.verifyToken,
  typeController.deleteMany
);
router.delete(
  `${typeRoute}/:id`,
  authMiddleware.verifyToken,
  typeController.delete
);

/* settings */
const settingRoute = "/settings";
router.get(`${settingRoute}`, settingController.getAll);
router.post(`${settingRoute}`, settingController.create);
router.get(`${settingRoute}/:_id`, settingController.getById);
router.get(`${settingRoute}/name/:name`, settingController.getByName);
router.put(`${settingRoute}/:_id`, settingController.update);
router.delete(`${settingRoute}/:_id`, settingController.delete);

module.exports = router;
