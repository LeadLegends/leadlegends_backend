
// first run these commands in terminal to install nodemailer and dotenv
// npm install nodemailer dotenv

import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,        // e.g. smtp.gmail.com
      port: process.env.EMAIL_PORT,        // e.g. 465 for secure
      secure: true,                        // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,      // your email
        pass: process.env.EMAIL_PASS,      // your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;