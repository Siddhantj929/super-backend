import { badRequest, unauthorized } from '../../../utils/http-errors.js';

export default class AuthController {
  constructor({ usersService, authService }) {
    this.usersService = usersService;
    this.authService = authService;
  }

  async login(request, reply) {
    const { email, password } = request.body;

    if (!email || !password) throw badRequest('Email and password are required');

    const user = await this.usersService.getUserByEmailWithPassword(email);
    if (!user) throw unauthorized('Invalid credentials');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw unauthorized('Invalid credentials');

    const tokens = await this.authService.startSession(user._id);
    await this.usersService.updateLastLogin(user._id);

    return reply.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role._id,
      },
    });
  }

  async refresh(request, reply) {
    const { refreshToken } = request.body;
    if (!refreshToken) throw badRequest('Refresh token is required');

    try {
      const tokens = await this.authService.refreshSession(refreshToken);
      return reply.send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      throw unauthorized('Invalid or expired refresh token');
    }
  }

  async logout(request, reply) {
    const { refreshToken } = request.body;
    if (!refreshToken) throw badRequest('Refresh token is required');

    try {
      await this.authService.closeSession(refreshToken);
      return reply.status(204).send();
    } catch (error) {
      throw unauthorized('Invalid refresh token');
    }
  }
}
