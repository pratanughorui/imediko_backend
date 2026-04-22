const crypto = require('crypto');

const SECRET = process.env.PASSKEY_SECRET || 'SUBSCRIPTION_SECRET';

const generatePasskey = (paymentId) => {
  const data = `${paymentId}|${SECRET}`;
  return Buffer.from(data).toString('base64');
};

const decodePasskey = (encodedKey) => {
  const decoded = Buffer.from(encodedKey, 'base64').toString('utf-8');
  const [paymentId, secret] = decoded.split('|');

  if (secret !== SECRET) {
    throw new Error('Invalid passkey');
  }

  return paymentId;
};

module.exports = {
  generatePasskey,
  decodePasskey,
};
