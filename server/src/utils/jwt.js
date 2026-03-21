const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'learnova_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'learnova_refresh_secret';

const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
