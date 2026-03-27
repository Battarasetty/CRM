const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendCampaignEmail = async (to, subject, content, campaignId, contactId) => {
  const trackingPixel = `<img src="${process.env.BASE_URL}/api/campaigns/${campaignId}/track/open/${contactId}" width="1" height="1" style="display:none"/>`;
  const unsubscribeLink = `<p style="font-size:11px;color:#9ca3af;margin-top:32px">Don't want these emails? <a href="${process.env.BASE_URL}/api/contacts/${contactId}/unsubscribe">Unsubscribe</a></p>`;

  await transporter.sendMail({
    from: `"Marketing CRM" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: content + trackingPixel + unsubscribeLink,
  });
};

const sendTestEmail = async (to, subject, content) => {
  await transporter.sendMail({
    from: `"Marketing CRM" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[TEST] ${subject}`,
    html: content,
  });
};

module.exports = { sendCampaignEmail, sendTestEmail };