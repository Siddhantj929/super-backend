export const CACHE_TTL = 300; // 5 minutes

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: times => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
};
