import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or custom SMTP using EMAIL_USER and EMAIL_PASS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Sterling Groom - Admin OTP Code',
    text: `Your admin verification code is: ${otp}. This code is valid for 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h2 style="color: #d4af37; text-align: center;">Sterling Groom Management OS</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">You are attempting to sign in as the Owner. Use the verification code below to authorize your session:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
