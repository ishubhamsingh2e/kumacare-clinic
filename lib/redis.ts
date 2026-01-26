import Redis from "ioredis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

class RedisCache {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn("Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      logger.info("Redis cache connected");
    });

    this.client.on("error", (err) => {
      this.isConnected = false;
      logger.error("Redis cache error", { error: err });
    });

    this.client.on("close", () => {
      this.isConnected = false;
      logger.warn("Redis cache connection closed");
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error("Redis get error", { error, key });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error("Redis set error", { error, key });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error("Redis del error", { error, key });
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error("Redis delPattern error", { error, pattern });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Redis exists error", { error, key });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error("Redis ttl error", { error, key });
      return -1;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      logger.error("Redis flush error", { error });
      return false;
    }
  }

  getClient(): Redis {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const redis = new RedisCache();

// Cache key builders
export const CacheKeys = {
  userClinics: (userId: string) => `user:${userId}:clinics`,
  medicines: (doctorId: string, page: number, limit: number, search: string) =>
    `medicines:${doctorId}:p${page}:l${limit}:s${search}`,
  medicineGroups: (doctorId: string) => `medicine-groups:${doctorId}`,
  patients: (clinicId: string, page: number, limit: number, search: string) =>
    `patients:${clinicId}:p${page}:l${limit}:s${search}`,
  appointments: (clinicId: string, date: string) =>
    `appointments:${clinicId}:${date}`,
  availableSlots: (doctorId: string, date: string) =>
    `slots:${doctorId}:${date}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  teamMembers: (clinicId: string) => `team:${clinicId}:members`,
  roles: (clinicId: string) => `roles:${clinicId}`,
  printSettings: (userId: string) => `print-settings:${userId}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
};
