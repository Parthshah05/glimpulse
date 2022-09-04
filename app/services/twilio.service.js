require("dotenv").config();

const accountSID = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceId = process.env.SERVICE_ID;
const client = require("twilio")(accountSID, authToken);

// const countryCode = process.env.TWILIO_ENV == "development" ? "+91" : "+1";

/* for send otp */
exports.sendOtp = async (phone_number, channel) => {
  let response;
  response = await client.verify.services(serviceId).verifications.create({
    to: phone_number,
    channel: channel ? channel : "sms",
  });

  return response;
};

/* for verify otp */
exports.verifyOtp = async (phone_number, code) => {
  let result;
  result = await client.verify.services(serviceId).verificationChecks.create({
    to: phone_number,
    code: code,
  });
  return result;
};
