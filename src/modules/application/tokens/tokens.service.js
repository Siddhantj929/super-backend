import jwt from 'jsonwebtoken';
import JWT_CONSTANTS from './tokens.constants.js';

class TokensService {
  generateAccessToken(payload) {
    return jwt.sign(payload, JWT_CONSTANTS.ACCESS_TOKEN_SECRET, {
      expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
      issuer: JWT_CONSTANTS.ISSUER,
      audience: JWT_CONSTANTS.AUDIENCE,
      algorithm: JWT_CONSTANTS.ALGORITHM,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_CONSTANTS.REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
      issuer: JWT_CONSTANTS.ISSUER,
      audience: JWT_CONSTANTS.AUDIENCE,
      algorithm: JWT_CONSTANTS.ALGORITHM,
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, JWT_CONSTANTS.ACCESS_TOKEN_SECRET, {
      issuer: JWT_CONSTANTS.ISSUER,
      audience: JWT_CONSTANTS.AUDIENCE,
      algorithm: JWT_CONSTANTS.ALGORITHM,
      clockTolerance: JWT_CONSTANTS.CLOCK_TOLERANCE,
    });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, JWT_CONSTANTS.REFRESH_TOKEN_SECRET, {
      issuer: JWT_CONSTANTS.ISSUER,
      audience: JWT_CONSTANTS.AUDIENCE,
      algorithm: JWT_CONSTANTS.ALGORITHM,
      clockTolerance: JWT_CONSTANTS.CLOCK_TOLERANCE,
    });
  }
}

export default TokensService;
