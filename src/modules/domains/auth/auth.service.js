import AUTH_CONSTANTS, { CACHE_KEYS } from './auth.constants.js';

export default class AuthService {
  constructor({ cacheService, tokensService }) {
    this.cacheService = cacheService;
    this.tokensService = tokensService;
  }

  _createSessionData(userId) {
    return { userId, createdAt: new Date().toISOString() };
  }

  async startSession(userId) {
    const accessToken = this.tokensService.generateAccessToken({ _id: userId });
    const refreshToken = this.tokensService.generateRefreshToken({ _id: userId });

    await this.cacheService.set(
      CACHE_KEYS.SESSION(refreshToken),
      this._createSessionData(userId),
      AUTH_CONSTANTS.SESSION_TTL
    );

    return { accessToken, refreshToken };
  }

  async refreshSession(refreshToken) {
    const { _id: userId } = this.tokensService.verifyRefreshToken(refreshToken);

    if (!(await this.sessionExists(refreshToken))) {
      throw new Error('Session not found or expired');
    }

    await this.closeSession(refreshToken);
    return this.startSession(userId);
  }

  async closeSession(refreshToken) {
    this.tokensService.verifyRefreshToken(refreshToken);
    await this.cacheService.delete(CACHE_KEYS.SESSION(refreshToken));
    return true;
  }

  async sessionExists(refreshToken) {
    return !!(await this.getSession(refreshToken));
  }

  async getSession(refreshToken) {
    return await this.cacheService.get(CACHE_KEYS.SESSION(refreshToken));
  }
}
