import fp from 'fastify-plugin';

const isDevelopment = process.env.NODE_ENV === 'development';

const createError = (title, message, statusCode) => ({
  errors: [{ title, message }],
  statusCode,
});

const mongooseValidationKinds = {
  required: err => ({ title: 'Missing Required Field', message: `${err.path} is required` }),
  minlength: err => ({
    title: 'Text Too Short',
    message: `${err.path} must be at least ${err.properties.minlength} characters long`,
  }),
  maxlength: err => ({
    title: 'Text Too Long',
    message: `${err.path} must be no more than ${err.properties.maxlength} characters long`,
  }),
  min: err => ({
    title: 'Value Too Small',
    message: `${err.path} must be at least ${err.properties.min}`,
  }),
  max: err => ({
    title: 'Value Too Large',
    message: `${err.path} must be no more than ${err.properties.max}`,
  }),
  enum: err => ({
    title: 'Invalid Selection',
    message: `${err.path} must be one of: ${err.properties.enumValues.join(', ')}`,
  }),
  unique: err => ({ title: 'Duplicate Value', message: `${err.path} must be unique` }),
};

const ajvValidationKeywords = {
  required: fieldName => ({ title: 'Missing Required Field', message: `${fieldName} is required` }),
  type: (fieldName, err) => ({
    title: 'Invalid Data Type',
    message: `${fieldName} must be a ${err.params?.type}`,
  }),
  minimum: (fieldName, err) => ({
    title: 'Value Too Small',
    message: `${fieldName} must be at least ${err.params?.limit}`,
  }),
  maximum: (fieldName, err) => ({
    title: 'Value Too Large',
    message: `${fieldName} must be no more than ${err.params?.limit}`,
  }),
  minLength: (fieldName, err) => ({
    title: 'Text Too Short',
    message: `${fieldName} must be at least ${err.params?.limit} characters long`,
  }),
  maxLength: (fieldName, err) => ({
    title: 'Text Too Long',
    message: `${fieldName} must be no more than ${err.params?.limit} characters long`,
  }),
  pattern: fieldName => ({ title: 'Invalid Format', message: `${fieldName} format is invalid` }),
  enum: (fieldName, err) => ({
    title: 'Invalid Selection',
    message: `${fieldName} must be one of: ${err.params?.allowedValues?.join(', ')}`,
  }),
  format: (fieldName, err) => ({
    title: 'Invalid Format',
    message: `${fieldName} must be a valid ${err.params?.format}`,
  }),
  additionalProperties: fieldName => ({
    title: 'Invalid Property',
    message: `${fieldName} contains unknown properties`,
  }),
};

const statusMessages = {
  400: { title: 'Bad Request', message: 'Please review your input and ensure the data is correct' },
  401: { title: 'Authentication Required', message: 'Please log in to continue' },
  403: { title: 'Access Denied', message: 'You do not have permission to access this resource' },
  404: { title: 'Not Found', message: 'The requested resource was not found' },
  409: { title: 'Conflict', message: 'The resource already exists' },
  422: { title: 'Invalid Input', message: 'Please check your data and try again' },
  429: { title: 'Too Many Requests', message: 'Please try again later' },
  500: { title: 'Internal Server Error', message: 'Please try again later' },
  502: { title: 'Bad Gateway', message: 'Service temporarily unavailable' },
  503: { title: 'Service Unavailable', message: 'Please try again later' },
};

const systemErrors = {
  ENOTFOUND: { title: 'Network Error', message: 'Unable to connect to the server' },
  ECONNREFUSED: { title: 'Connection Refused', message: 'The server is not responding' },
  ETIMEDOUT: { title: 'Request Timeout', message: 'The server took too long to respond' },
  EACCES: { title: 'Permission Denied', message: 'Insufficient access rights' },
  ENOENT: { title: 'File Not Found', message: 'File or directory not found' },
  EMFILE: { title: 'Resource Limit', message: 'System resource limit reached' },
  ENOSPC: { title: 'No Space', message: 'No space left on device' },
};

const parseError = error => {
  if (!error) return createError('Unknown Error', 'An unknown error occurred', 500);

  if (error.name === 'ValidationError' && error.errors && !Array.isArray(error.errors)) {
    const errors = Object.values(error.errors).map(
      err =>
        mongooseValidationKinds[err.kind]?.(err) || { title: 'Invalid Data', message: err.message }
    );
    return { errors, statusCode: 422 };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return createError('Duplicate Error', `${field} already exists and must be unique`, 409);
  }

  if (error.name === 'CastError')
    return createError(
      'Invalid Data',
      `Invalid ${error.path}: ${error.value} is not a valid ${error.kind}`,
      400
    );

  if (error.name === 'DocumentNotFoundError')
    return createError('Not Found', 'The requested resource was not found', 404);

  if (error.name === 'VersionError')
    return createError(
      'Concurrent Modification',
      'The document has been modified by another process. Please try again',
      409
    );

  if (error.validation && Array.isArray(error.validation)) {
    const errors = error.validation.map(err => {
      const field = err.instancePath ? err.instancePath.slice(1) : '';
      const fieldName = field || err.params?.missingProperty || 'field';
      return (
        ajvValidationKeywords[err.keyword]?.(fieldName, err) || {
          title: 'Validation Error',
          message: err.message || `${fieldName} is invalid`,
        }
      );
    });
    return { errors, statusCode: 422 };
  }

  if (error.name === 'ValidationError' && error.errors && Array.isArray(error.errors)) {
    const errors = error.errors.map(err => {
      const field = err.instancePath ? err.instancePath.slice(1) : '';
      const fieldName = field || err.params?.missingProperty || 'field';
      return (
        ajvValidationKeywords[err.keyword]?.(fieldName, err) || {
          title: 'Validation Error',
          message: err.message || `${fieldName} is invalid`,
        }
      );
    });
    return { errors, statusCode: 422 };
  }

  if (error.statusCode) {
    const errorObj = statusMessages[error.statusCode] || {
      title: 'Error',
      message: `Error ${error.statusCode}`,
    };
    return { errors: [errorObj], statusCode: error.statusCode };
  }

  if (error.code && systemErrors[error.code])
    return { errors: [systemErrors[error.code]], statusCode: 503 };

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const title = error.name === 'TokenExpiredError' ? 'Token Expired' : 'Invalid Token';
    return createError(title, 'Please log in again', 401);
  }

  if (error.message) {
    const message = error.message
      .replace(/Error: /g, '')
      .replace(/at .*$/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    return createError('Error', message, 500);
  }

  return createError('Unexpected Error', 'An unexpected error occurred. Please try again', 500);
};

const createErrorResponse = (parsedError, request, statusCode) => {
  const shouldShowDetails = !!request.user || isDevelopment || statusCode === 422;

  if (!shouldShowDetails)
    return {
      success: false,
      errors: [
        { title: 'Bad Request', message: 'An error occurred while processing your request' },
      ],
      statusCode: 400,
    };

  return {
    success: false,
    errors: parsedError.errors,
    statusCode: statusCode || parsedError.statusCode,
    ...(isDevelopment && { stack: parsedError.stack }),
  };
};

async function errorSerializer(fastify) {
  fastify.setErrorHandler(async (error, request, reply) => {
    const parsedError = parseError(error);
    const statusCode = parsedError.statusCode || error.statusCode || reply.statusCode || 500;
    const errorResponse = createErrorResponse(parsedError, request, statusCode);
    reply.status(errorResponse.statusCode);
    return errorResponse;
  });

  fastify.decorate('serializeError', (error, request, statusCode) => {
    const parsedError = parseError(error);
    return createErrorResponse(parsedError, request, statusCode);
  });
}

export default fp(errorSerializer, {
  name: 'errorSerializer',
  dependencies: [],
});
