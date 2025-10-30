export const ROLE_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
});

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const SORT_FIELDS = Object.freeze({
  CREATED_AT: 'createdAt',
  NAME: 'name',
  STATUS: 'status',
});

export const CACHE_KEYS = Object.freeze({
  SINGLE: id => `roles:single:${id}`,
  NAME: name => `roles:name:${name}`,
  GUEST_PERMISSIONS: 'roles:permissions:Guest',
  LIST: (page, limit, status, searchTerm, dateFrom, dateTo, sortBy, sortOrder) =>
    `roles:list:${page}:${limit}:${status || 'all'}:${searchTerm || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${sortBy}:${sortOrder}`,
  CREATED_BY: (userId, page, limit, status, searchTerm, sortBy, sortOrder) =>
    `roles:created-by:${userId}:${page}:${limit}:${status || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
  PERMISSION: (permission, page, limit, status, sortBy, sortOrder) =>
    `roles:permission:${permission}:${page}:${limit}:${status || 'all'}:${sortBy}:${sortOrder}`,
});

export const CACHE_PATTERNS = Object.freeze({
  LIST: 'roles:list:*',
});
