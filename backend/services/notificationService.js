const twilio = require('twilio');

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH) {
    console.warn('Twilio env vars missing — notifications disabled');
    return null;
  }
  client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  return client;
}

const MESSAGES = {
  pending: (id) => `Your complaint #${id} has been received by India Smart Cities Portal. We will update you on progress.`,
  assigned: (id) => `Your complaint #${id} has been assigned to a district officer. They will visit soon.`,
  in_progress: (id) => `Update on complaint #${id}: Our team is now working on the issue at your location.`,
  resolved: (id, note) => `Your complaint #${id} has been resolved. ${note ? 'Note: ' + note : 'Thank you for reporting!'}`,
  rejected: (id, note) => `Your complaint #${id} could not be processed. ${note ? 'Reason: ' + note : 'Please contact the district office for more details.'}`,
};

async function sendSMS(phone, message) {
  try {
    const c = getClient();
    if (!c) return;
    await c.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });
    console.log(`SMS sent to +91${phone}`);
  } catch (err) {
    console.error(`SMS failed to +91${phone}:`, err.message);
  }
}

async function sendWhatsApp(phone, message) {
  try {
    const c = getClient();
    if (!c || !process.env.TWILIO_WHATSAPP_FROM) return;
    await c.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+91${phone}`,
    });
    console.log(`WhatsApp sent to +91${phone}`);
  } catch (err) {
    console.error(`WhatsApp failed to +91${phone}:`, err.message);
  }
}

async function notifyStatusChange(complaintId, status, citizenPhone, note = '') {
  const msgFn = MESSAGES[status];
  if (!msgFn || !citizenPhone) return;
  const message = msgFn(complaintId, note);
  await Promise.all([
    sendSMS(citizenPhone, message),
    sendWhatsApp(citizenPhone, message),
  ]);
}

module.exports = { notifyStatusChange, sendSMS };
