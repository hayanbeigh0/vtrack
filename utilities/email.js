const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
   // 1. Create transporter
   const transporter = nodemailer.createTransport({
      // host: process.env.EMAIL_HOST,
      // port: process.env.EMAIL_PORT,
      // auth: {
      //    user: process.env.EMAIL_USER,
      //    pass: process.env.EMAIL_PASSWORD,
      // },
      service: 'SendGrid',
      auth: {
         user: process.env.SENDGRID_USERNAME,
         pass: process.env.SENDGRID_PASSWORD
      }

   });

   // 2. Define mail options
   const mailOptions = {
      from: 'Hayan Beigh, <hello@vtrack.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
   };

   // 2. Send email
   await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
