const path = require('path');
const dotenv = require('dotenv');

const ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
});

function loadEnv() {
  const root = path.resolve(__dirname, '..');
  const envPath = path.join(root, '.env');
  // Use dotenv to load variables without overriding existing env.
  dotenv.config({ path: envPath, override: false });
  if (!process.env.ENVIRONMENT) process.env.ENVIRONMENT = ENVIRONMENTS.DEVELOPMENT;
}

function getEnvironment() {
  const value = String(process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT).toLowerCase();
  switch (value) {
    case ENVIRONMENTS.PRODUCTION:
      return ENVIRONMENTS.PRODUCTION;
    case ENVIRONMENTS.TEST:
      return ENVIRONMENTS.TEST;
    case ENVIRONMENTS.DEVELOPMENT:
    default:
      return ENVIRONMENTS.DEVELOPMENT;
  }
}

module.exports = { loadEnv, getEnvironment, ENVIRONMENTS };
