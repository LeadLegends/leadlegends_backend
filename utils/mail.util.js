import sgMail from "@sendgrid/mail";

export const sendOtpEmail = async ({ to, otp }) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error("SENDGRID_FROM_EMAIL is not configured");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Leadlegends - Your OTP Code",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <h2>Legends Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `
  };

  await sgMail.send(msg);
};
