const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "mandalrajeev3@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (to, name, verificationUrl) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER || "mandalrajeev3@gmail.com",
    to,
    subject: "Verify your StayNest account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏠 Welcome to StayNest!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #666; line-height: 1.6;">Thank you for registering with StayNest! Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-size: 18px;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 14px;">If you did not create this account, you can safely ignore this email.</p>
        </div>
        <div style="background: #333; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is an automated message from StayNest.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
};
