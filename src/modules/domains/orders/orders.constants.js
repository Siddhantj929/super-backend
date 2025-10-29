export const ORDER_STATUS = Object.freeze({
  APPROVED: 'approved',
  CREATED: 'created',
  DELIVERED: 'delivered',
  INVOICED: 'invoiced',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  UNAVAILABLE: 'unavailable',
  CANCELED: 'canceled',
});

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const SORT_FIELDS = Object.freeze({
  CREATED_AT: 'createdAt',
  PURCHASE_TIMESTAMP: 'purchaseTimestamp',
  APPROVED_AT: 'approvedAt',
  DELIVERED_CUSTOMER_DATE: 'deliveredCustomerDate',
  ESTIMATED_DELIVERY_DATE: 'estimatedDeliveryDate',
  STATUS: 'status',
});

export const CACHE_KEYS = Object.freeze({
  SINGLE: id => `orders:single:${id}`,
  CUSTOMER: customerId => `orders:customer:${customerId}`,
  LIST: (page, limit, status, customerId, dateFrom, dateTo, sortBy, sortOrder) =>
    `orders:list:${page}:${limit}:${status || 'all'}:${customerId || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${sortBy}:${sortOrder}`,
  STATUS: (status, page, limit, dateFrom, dateTo, sortBy, sortOrder) =>
    `orders:status:${status}:${page}:${limit}:${dateFrom || 'all'}:${dateTo || 'all'}:${sortBy}:${sortOrder}`,
  CUSTOMER_ORDERS: (customerId, page, limit, status, dateFrom, dateTo, sortBy, sortOrder) =>
    `orders:customer-orders:${customerId}:${page}:${limit}:${status || 'all'}:${dateFrom || 'all'}:${dateTo || 'all'}:${sortBy}:${sortOrder}`,
});

export const CACHE_PATTERNS = Object.freeze({
  LIST: 'orders:list:*',
  CUSTOMER: customerId => `orders:customer:${customerId}*`,
});
