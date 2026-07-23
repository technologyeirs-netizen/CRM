const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  logger: true,
  debug: true,
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("========== SMTP CONFIG ==========");
    console.log({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
    });

    console.log("Verifying SMTP...");

    await transporter.verify();

    console.log("✅ SMTP Verified");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email Sent");
    console.log(info);

    return info;
  } catch (err) {
    console.error("========== SMTP ERROR ==========");
    console.error("Code:", err.code);
    console.error("Command:", err.command);
    console.error("Response:", err.response);
    console.error("Response Code:", err.responseCode);
    console.error("Message:", err.message);
    console.error(err);

    throw new Error(
      err.response ||
      err.message ||
      "SMTP Connection Failed"
    );
  }
};

module.exports = {
  sendEmail,
};