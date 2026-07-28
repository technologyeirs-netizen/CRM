const crypto = require('crypto');

// This utility stores a REVERSIBLE, encrypted copy of an employee's password
// so that it can be shown back in the "Edit Employee" form (as requested).
// The employee's real authentication still uses the one-way bcrypt hash
// stored in `password` (see Employee.js) — this encrypted copy is only used
// for display/editing purposes and never for login checks.

const ALGORITHM = 'aes-256-cbc';

// Derive a stable 32-byte key from an env secret (falls back to JWT_SECRET,
// then a default so local/dev setups still work without extra config).
const getKey = () => {
  const secret =
    process.env.PASSWORD_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'crm-default-password-encryption-key';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

// Returns "iv:encryptedHex"
const encryptPassword = (plainText) => {
  if (!plainText) return undefined;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decryptPassword = (payload) => {
  if (!payload || typeof payload !== 'string' || !payload.includes(':')) return '';
  try {
    const [ivHex, encryptedHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    return '';
  }
};

module.exports = { encryptPassword, decryptPassword };
