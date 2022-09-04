const moment = require("moment");

const masterGlimpulseService = require("../services/master_glimpulse.service");

/* set glimpulse of the day */
exports.setGlimpleOfTheDay = async (req, res) => {
  try {
    const format1 = "YYYY-MM-DD";
    const glimpulses = await masterGlimpulseService.getAllGlimpulse();
    const today = moment().format(format1);
    const index = glimpulses.findIndex((o) => {
      if (o.start_date && o.end_date) {
        const start_date = moment(o.start_date).format(format1);
        const end_date = moment(o.end_date).format(format1);
        return (
          moment(today).isSame(start_date) ||
          moment(today).isBetween(start_date, end_date, undefined, "[]")
        );
      }
    });

    const glimpulse = glimpulses[index];
    await masterGlimpulseService.setGlimpleOfTheDay(glimpulse._id);
    // return res
    //   .status(200)
    //   .json({ status: true, message: "Glimple of the day" });
  } catch (err) {
    console.log("Error while getting glimpulses: ", err);
  }
};
