import Redis from 'ioredis';
import { REDIS_CONFIG, REDIS_OPTIONS, CACHE_TTL } from './cache.constants.js';

export default class CacheService {
  constructor() {
    this.client = new Redis(REDIS_CONFIG, REDIS_OPTIONS);

    this.client.on('error', error => console.error('Redis Client Error:', error));
    this.client.on('connect', () => {
      this.client.flushall();
      console.log('✓ Redis connected');
    });
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = CACHE_TTL) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttl, serializedValue);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern) {
    try {
      const stream = this.client.scanStream({ match: pattern, count: 100 });
      const keys = [];

      stream.on('data', resultKeys => keys.push(...resultKeys));

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
    }
  }

  async flush() {
    try {
      await this.client.flushall();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  async getStats() {
    try {
      const info = await this.client.info('stats');
      return {
        totalCommandsProcessed: this._extractInfoValue(info, 'total_commands_processed'),
        instantaneousOpsPerSec: this._extractInfoValue(info, 'instantaneous_ops_per_sec'),
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  _extractInfoValue(info, key) {
    const match = info.match(new RegExp(`${key}:(\\d+)`));
    return match ? parseInt(match[1], 10) : 0;
  }

  async disconnect() {
    await this.client.quit();
  }
}
