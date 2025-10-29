const AUTH_CONSTANTS = Object.freeze({
  SESSION_TTL: parseInt(process.env.AUTH_SESSION_TTL) || 7 * 24 * 60 * 60,
  SESSION_KEY_PREFIX: 'session:',
  REFRESH_TOKEN_KEY_PREFIX: 'refresh:',
});

export const CACHE_KEYS = Object.freeze({
  SESSION: refreshToken => `${AUTH_CONSTANTS.REFRESH_TOKEN_KEY_PREFIX}${refreshToken}`,
});

export default AUTH_CONSTANTS;
