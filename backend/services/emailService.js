import nodemailer from 'nodemailer';

export const sendJobNotification = async (userEmail, jobTitle, companyName) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `New Job Opportunity: ${jobTitle}`,
    text: `Hello,\n\nA new job matching your profile has been posted: ${jobTitle} at ${companyName}.\n\nCheck it out on our platform!`
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`Email notification (simulation) to ${userEmail}: New job ${jobTitle} at ${companyName}`);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
