import { transporter, fromEmail } from './transporter';

export async function sendRequestConfirmationEmail(toEmail: string, saloonName: string) {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: 'Saloon Setup Request Received - The Barber',
    text: `Your request for "${saloonName}" has been successfully received. Soon as possible your saloon will be created in the Sri Lankan number #01 saloon management platform "The Barber". Powered by Quantum Blaze - www.quantumblaze.lk`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #a855f7; text-align: center; margin-bottom: 5px;">Request Received!</h2>
        <h3 style="color: #1f2937; text-align: center; margin-top: 0; font-weight: 500;">Saloon Setup Request</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          Hi there,
          <br/><br/>
          Your request for <strong>${saloonName}</strong> has been successfully received. 
          Soon as possible your saloon will be created in the Sri Lankan number #01 saloon management platform <strong>"The Barber"</strong>.
        </p>
        <div style="border-top: 1px solid #f3f4f6; margin-top: 30px; padding-top: 15px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">Powered by Quantum Blaze</p>
          <p style="font-size: 11px; margin: 4px 0 0 0;">
            <a href="https://www.quantumblaze.lk" target="_blank" style="color: #a855f7; text-decoration: none; font-weight: bold;">www.quantumblaze.lk</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
