const apiRoute = "/api";

/* routes */
module.exports = (app) => {
  app.use(`${apiRoute}/auth`, require("./auth.routes"));
  app.use(
    `${apiRoute}/users/glimpulses`,
    require("./user_created_glimpulses.routes")
  );
  app.use(`${apiRoute}/users`, require("./users.routes"));
  app.use(`${apiRoute}/glimpulses`, require("./master_glimpulses.routes"));
  app.use(`${apiRoute}/categories`, require("./categories.routes"));
  app.use(`${apiRoute}/cloudinary`, require("./cloudinary.routes"));
  app.use(`${apiRoute}/types`, require("./types.routes"));
  app.use(`${apiRoute}/subcategories`, require("./subcategories.routes"));

  /* admin APIs */
  app.use(`${apiRoute}/admin`, require("./admin.routes"));
};
