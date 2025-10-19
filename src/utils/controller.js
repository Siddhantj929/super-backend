/**
 * Utility function to get a controller from DI container and call a method
 * @param {string} controllerName - Name of the controller in DI container (e.g., 'rolesController')
 * @param {string} methodName - Name of the method to call on the controller
 * @returns {Function} - Fastify handler function
 */
export const controller = (controllerName, methodName) => {
  return async (request, reply) => {
    const controller = request.server.diContainer.cradle[controllerName];
    return await controller[methodName](request, reply);
  };
};
