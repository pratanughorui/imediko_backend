const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendSubscriptionApprovedMail = async ({
  to,
  userName,
  amount,
  duration,
  productLink,
}) => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.MAIL_USER}>`,
      to: to,
      subject: 'Subscription Approved 🎉',
      html: `
      <h3>Hello ${userName},</h3>
      <p>Your subscription is <b>approved</b>.</p>
      <p><b>Amount:</b> ₹${amount}</p>
      <p><b>Duration:</b> ${duration}</p>

      <p>
        👉 <a href="${productLink}">Click here to access the game</a>
      </p>

      <br/>
      <p>Thanks for subscribing!</p>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Subscription approval mail sent');
  } catch (error) {
    console.error('Mail send error:', error);
  }
};

module.exports = {
  sendSubscriptionApprovedMail,
};
