import fp from 'fastify-plugin';
import { ROLE_STATUS, CACHE_KEYS } from '../../modules/application/roles/roles.constants.js';
import { forbidden } from '../../utils/http-errors.js';

async function accessGuard(fastify, opts) {
  async function _getGuestPermissions() {
    const { cacheService, rolesService } = fastify.diContainer.cradle;
    let permissions = await cacheService.get(CACHE_KEYS.GUEST_PERMISSIONS);

    if (!permissions) {
      const guestRole = await rolesService.getRoleByName('Guest');
      permissions = guestRole?.permissions || [];
      await cacheService.set(CACHE_KEYS.GUEST_PERMISSIONS, permissions, 3600);
    }

    return permissions;
  }

  function _hasPermission(permissions, method, url) {
    const normalizedUrl = url.split('?')[0];

    if (permissions.includes(`${method} ${normalizedUrl}`)) return true;

    return permissions.some(permission => {
      const [permMethod, permPath] = permission.split(' ', 2);
      if (permMethod !== method) return false;

      // Handle both parameterized routes (:param) and wildcards (*)
      const regexPattern = permPath
        .replace(/:\w+/g, '[^/]+') // Replace :param with regex to match path segments
        .replace(/\*/g, '.*') // Replace * with regex to match any characters
        .replace(/\//g, '\\/'); // Escape forward slashes for regex

      return new RegExp(`^${regexPattern}$`).test(normalizedUrl);
    });
  }

  fastify.addHook('preHandler', async (request, reply) => {
    const { method, url, user } = request;
    let permissions = [];

    if (!user) {
      permissions = await _getGuestPermissions();
    } else {
      if (!user.role) throw forbidden('User does not have an assigned role');
      if (user.role.status === ROLE_STATUS.DISABLED) throw forbidden('User role is disabled');
      permissions = user.role.permissions || [];
    }

    if (!_hasPermission(permissions, method, url))
      throw forbidden('You do not have permission to access this resource');
  });
}

export default fp(accessGuard, {
  name: 'access-guard',
});
