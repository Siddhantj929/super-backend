export const PAYMENT_TYPE = Object.freeze({
  CREDIT_CARD: 'credit_card',
  BOLETO: 'boleto',
  VOUCHER: 'voucher',
  DEBIT_CARD: 'debit_card',
});

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

export const SORT_FIELDS = Object.freeze({
  CREATED_AT: 'createdAt',
  PAYMENT_VALUE: 'value',
  PAYMENT_INSTALLMENTS: 'installments',
  PAYMENT_TYPE: 'type',
});

export const CACHE_KEYS = Object.freeze({
  SINGLE: id => `payments:single:${id}`,
  ORDER: orderId => `payments:order:${orderId}`,
  LIST: (
    page,
    limit,
    type,
    orderId,
    minValue,
    maxValue,
    minInstallments,
    maxInstallments,
    sortBy,
    sortOrder
  ) =>
    `payments:list:${page}:${limit}:${type || 'all'}:${orderId || 'all'}:${minValue || 'all'}:${maxValue || 'all'}:${minInstallments || 'all'}:${maxInstallments || 'all'}:${sortBy}:${sortOrder}`,
  TYPE: (type, page, limit, minValue, maxValue, sortBy, sortOrder) =>
    `payments:type:${type}:${page}:${limit}:${minValue || 'all'}:${maxValue || 'all'}:${sortBy}:${sortOrder}`,
  ORDER_PAYMENTS: (orderId, page, limit, type, sortBy, sortOrder) =>
    `payments:order-payments:${orderId}:${page}:${limit}:${type || 'all'}:${sortBy}:${sortOrder}`,
});

export const CACHE_PATTERNS = Object.freeze({
  LIST: 'payments:list:*',
  ORDER: orderId => `payments:order:${orderId}*`,
});
