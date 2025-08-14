// backend/config.js
require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  YF_CACHE_TTL_MS: parseInt(process.env.YF_CACHE_TTL_MS || '600000', 10), // 10 min
};
