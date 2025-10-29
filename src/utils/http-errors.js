export const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const badRequest = message => createHttpError(400, message);
export const unauthorized = message => createHttpError(401, message);
export const forbidden = message => createHttpError(403, message);
export const notFound = message => createHttpError(404, message);
export const conflict = message => createHttpError(409, message);
export const unprocessableEntity = message => createHttpError(422, message);
export const internalServerError = message => createHttpError(500, message);
