const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("========== RESEND EMAIL ==========");

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html:
        html ||
        `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#0d6efd;">EIRS Technology</h2>
          <p>${text}</p>

          <hr/>

          <p style="font-size:12px;color:#666;">
            This is an automated email from EIRS Technology.
            Please do not reply to this email.
          </p>
        </div>
        `,
    });

    console.log("✅ Email Sent Successfully");
    console.log(response);

    return response;
  } catch (error) {
    console.error("========== RESEND ERROR ==========");
    console.error(error);

    throw new Error(
      error.message ||
      "Unable to send email using Resend."
    );
  }
};

module.exports = {
  sendEmail,
};