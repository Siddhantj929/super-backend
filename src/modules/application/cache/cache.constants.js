export const CACHE_TTL = 300; // 5 minutes

export const REDIS_CONFIG = process.env.REDIS_URL || 'redis://localhost:6379';

export const REDIS_OPTIONS = {
  retryStrategy: times => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
};
