const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendCampaignEmail = async (to, subject, content, contactId) => {
  const trackingPixel = `<img src="${process.env.BASE_URL}/api/campaigns/track/open/${contactId}" width="1" height="1" />`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: content + trackingPixel,
  });
};

module.exports = { sendCampaignEmail };