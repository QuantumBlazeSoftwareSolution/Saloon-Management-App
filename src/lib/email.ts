import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
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
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
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

export async function sendSaloonSetupEmail(toEmail: string, saloonName: string, setupLink: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your Saloon System is ready!',
    text: `Your saloon system for "${saloonName}" is ready. Please set up your password here: ${setupLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #eab308; text-align: center; margin-bottom: 5px;">Congratulations!</h2>
        <h3 style="color: #1f2937; text-align: center; margin-top: 0; font-weight: 500;">Your Saloon System is ready</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          We have successfully set up the management system for <strong>${saloonName}</strong>. 
          To complete your registration and start managing your saloon, please click the button below to set up your owner password:
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${setupLink}" style="background-color: #eab308; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">
          If the button above does not work, copy and paste this link in your browser:<br/>
          <a href="${setupLink}" style="color: #3b82f6;">${setupLink}</a>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
