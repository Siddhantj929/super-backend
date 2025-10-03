const JWT_CONSTANTS = Object.freeze({
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
  ALGORITHM: process.env.JWT_ALGORITHM || "HS256",
  ISSUER: process.env.JWT_ISSUER || "charisma-api",
  AUDIENCE: process.env.JWT_AUDIENCE || "charisma-client",
  CLOCK_TOLERANCE: process.env.JWT_CLOCK_TOLERANCE || "30s",
  MAX_AGE: process.env.JWT_MAX_AGE || "15m",
});

export default JWT_CONSTANTS;
