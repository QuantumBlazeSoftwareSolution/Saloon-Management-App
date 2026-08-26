import { transporter, fromEmail } from './transporter';

export async function sendAdminNotificationEmail(
  toEmail: string, 
  saloonName: string, 
  ownerEmail: string, 
  ownerPhone: string
) {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: 'New Saloon Registration Request - Admin Alert',
    text: `A new saloon setup request has been submitted.\n\nSaloon Name: ${saloonName}\nOwner Email: ${ownerEmail}\nPhone Number: ${ownerPhone}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #ef4444; text-align: center; margin-bottom: 5px;">Admin Alert!</h2>
        <h3 style="color: #1f2937; text-align: center; margin-top: 0; font-weight: 500;">New Saloon Request Submitted</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          A user has submitted a saloon registration request with the following details:
        </p>
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 15px; border-radius: 8px; font-size: 13px;">
          <p style="margin: 0 0 8px 0;"><strong>Saloon Name:</strong> ${saloonName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Owner Email:</strong> ${ownerEmail}</p>
          <p style="margin: 0;"><strong>Phone Number:</strong> ${ownerPhone}</p>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">
          Log into the Super Admin panel to review and approve this request.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
