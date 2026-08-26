import { transporter, fromEmail } from './transporter';

export async function sendSaloonSetupEmail(toEmail: string, saloonName: string, setupLink: string) {
  const mailOptions = {
    from: fromEmail,
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
