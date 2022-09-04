/* dot env config */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const app = express();

const cronController = require("./app/controllers/cron.controller");

/* db connection */
require("./config/db.js");

/* environment variables */
const PORT = process.env.PORT || 4000;

app.use(cors());
//for request and response data in json and urlencoded format
app.use(express.json({limit: '50mb'}));
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: false,
  })
);

/* logs */
app.use(morgan("dev"));
// app.use(express.static(__dirname + '/public/uploads'));

// cron.schedule("0 0 * * *", () => {
//   console.log("Running cron job for updating glimpulse of the day.");
//   console.log("This job running in every minute");
//   cronController.setGlimpleOfTheDay();
// });

/* routes */
require("./app/routes")(app);

app.route("/").get((req, res) => {
  res.send("Welcome To Glimpulses");
});

/* server listen */
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
