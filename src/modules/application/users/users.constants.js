export const USER_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  ESCALATED: 'escalated',
  DISABLED: 'disabled',
});

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const SORT_FIELDS = Object.freeze({
  CREATED_AT: 'createdAt',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE: 'phone',
  STATUS: 'status',
});

export const CACHE_KEYS = Object.freeze({
  SINGLE: id => `users:single:${id}`,
  ME: id => `users:me:${id}`,
  EMAIL: email => `users:email:${email}`,
  PHONE: phone => `users:phone:${phone}`,
  LIST: (
    page,
    limit,
    status,
    role,
    searchTerm,
    dateFrom,
    dateTo,
    latitude,
    longitude,
    radius,
    sortBy,
    sortOrder
  ) =>
    `users:list:${page}:${limit}:${status || 'all'}:${role || 'all'}:${searchTerm || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${latitude || 'all'}:${longitude || 'all'}:${radius}:${sortBy}:${sortOrder}`,
  ROLE: (roleId, page, limit, status, searchTerm, sortBy, sortOrder) =>
    `users:role:${roleId}:${page}:${limit}:${status || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
  STATUS: (status, page, limit, role, searchTerm, sortBy, sortOrder) =>
    `users:status:${status}:${page}:${limit}:${role || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
});

export const CACHE_PATTERNS = Object.freeze({
  LIST: 'users:list:*',
});
