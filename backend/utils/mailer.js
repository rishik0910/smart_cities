const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER / GMAIL_APP_PASSWORD missing — email sending disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

async function sendMail(to, subject, html) {
  const t = getTransporter();
  if (!t || !to) return false;
  try {
    await t.sendMail({
      from: `"India Smart Cities" <${process.env.GMAIL_USER}>`,
      to, subject, html,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
}

const wrap = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <h2 style="color:#1E5C28;margin-bottom:4px;">India Smart Cities</h2>
    <h3 style="margin-top:18px;">${title}</h3>
    ${bodyHtml}
    <p style="color:#999;font-size:12px;margin-top:28px;">If this wasn't you, please secure your account immediately.</p>
  </div>
`;

exports.sendLoginAlert = (user) => {
  if (!user?.email) return Promise.resolve(false);
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return sendMail(
    user.email,
    'New sign-in to your account',
    wrap('New sign-in detected', `<p>Hi ${user.name || ''},</p><p>We noticed a new sign-in to your account on <b>${when}</b> (IST).</p>`)
  );
};

exports.sendOtpEmail = (email, code) => sendMail(
  email,
  'Your Smart Cities login code',
  wrap('Your one-time login code', `<p>Your verification code is:</p>
    <p style="font-size:28px;font-weight:800;letter-spacing:4px;">${code}</p>
    <p>This code expires in 10 minutes.</p>`)
);

exports.sendResetEmail = (email, resetLink) => sendMail(
  email,
  'Reset your password',
  wrap('Reset your password', `<p>Click the button below to set a new password. This link expires in 30 minutes.</p>
    <p><a href="${resetLink}" style="background:#1E5C28;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Reset Password</a></p>
    <p style="font-size:12px;color:#999;">Or paste this link in your browser: ${resetLink}</p>`)
);
