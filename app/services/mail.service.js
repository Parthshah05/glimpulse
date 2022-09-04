require("dotenv").config();

const accountSID = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceId = process.env.SERVICE_ID;
const client = require("twilio")(accountSID, authToken);

const nodemailer = require("nodemailer");

const mails = {
  sendMail: async (data) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ID_MAIL,
        pass: process.env.EMAIL_PASSWORD_MAIL,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const output = `
        <p>Welcome to the Glimpulse</p>
        <p>Your OTP is <b>${data.email_content}</b></p>
        `;
    let mailOptions = {
      from: process.env.EMAIL_ID_MAIL,
      to: data.to_email,
      subject: data.subject,
      html: data.output ? data.output : output,
      // /template:'../templates/sample.html'/
    };

    return transporter.sendMail(mailOptions);
  },

  sendEmailOtp: async (email, channel) => {
    return client.verify
      .services(serviceId) //Put the Verification service SID here
      .verifications.create({ to: email, channel: "email" });
  },

  verifyEmailOtp: async (email, code) => {
    return client.verify
      .services(serviceId) //Put the Verification service SID here
      .verificationChecks.create({
        to: email,
        code: code,
      });
  },
};

module.exports = mails;
