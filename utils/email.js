const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'expertwriterz.inc@gmail.com',
      pass: 'husna1991'
    }
  });

  //define email options
  const mailOptions = {
    from: 'timothylubs<nodemailer.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h1>Good morning all of you</h1>`
  };

  //actually send the mail
 
 return  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
