import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Use generic ethereal or placeholder SMTP for now
  // Real config will require user to provide credentials in .env
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal_user',
      pass: process.env.EMAIL_PASS || 'ethereal_pass'
    }
  });

  const mailOptions = {
    from: 'Recruitment Platform <noreply@recruitment.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
