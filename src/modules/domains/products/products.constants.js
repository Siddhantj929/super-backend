export const PRODUCT_STATUS = Object.freeze({
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
  CATEGORY_NAME: 'categoryName',
  WEIGHT_G: 'weightG',
  STATUS: 'status',
});

export const CACHE_KEYS = Object.freeze({
  SINGLE: id => `products:single:${id}`,
  ME: userId => `products:me:${userId}`,
  LIST: (
    page,
    limit,
    status,
    categoryName,
    searchTerm,
    dateFrom,
    dateTo,
    createdBy,
    sortBy,
    sortOrder
  ) =>
    `products:list:${page}:${limit}:${status || 'all'}:${categoryName || 'all'}:${searchTerm || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${createdBy || 'all'}:${sortBy}:${sortOrder}`,
  CATEGORY: (categoryName, page, limit, status, searchTerm, sortBy, sortOrder) =>
    `products:category:${categoryName}:${page}:${limit}:${status || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
  CREATED_BY: (userId, page, limit, status, categoryName, searchTerm, sortBy, sortOrder) =>
    `products:created-by:${userId}:${page}:${limit}:${status || 'all'}:${categoryName || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
  STATUS: (status, page, limit, categoryName, searchTerm, sortBy, sortOrder) =>
    `products:status:${status}:${page}:${limit}:${categoryName || 'all'}:${searchTerm || 'all'}:${sortBy}:${sortOrder}`,
});

export const CACHE_PATTERNS = Object.freeze({
  LIST: 'products:list:*',
  ME: userId => `products:me:${userId}*`,
});
