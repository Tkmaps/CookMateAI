const Redis = require('ioredis');
const { redisConfig } = require('./index');

let redisClient = null;

// Initialize Redis connection
async function connectRedis() {
  try {
    redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryDelayOnFailover: redisConfig.retryDelayOnFailover,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: redisConfig.lazyConnect
    });

    // Test connection
    await redisClient.ping();
    console.log('Redis connection established successfully.');

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    console.error('Unable to connect to Redis:', error);
    throw error;
  }
}

// Get Redis client instance
function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

// Session management utilities
class SessionManager {
  constructor() {
    this.client = getRedisClient();
    this.sessionPrefix = 'session:';
    this.userPrefix = 'user:';
  }

  // Store session data
  async setSession(sessionId, data, ttl = 3600) {
    const key = `${this.sessionPrefix}${sessionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  // Retrieve session data
  async getSession(sessionId) {
    const key = `${this.sessionPrefix}${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Update session data
  async updateSession(sessionId, updates, ttl = 3600) {
    const existing = await this.getSession(sessionId);
    if (existing) {
      const updated = { ...existing, ...updates };
      await this.setSession(sessionId, updated, ttl);
      return updated;
    }
    return null;
  }

  // Delete session
  async deleteSession(sessionId) {
    const key = `${this.sessionPrefix}${sessionId}`;
    await this.client.del(key);
  }

  // Store user context
  async setUserContext(userId, context, ttl = 86400) {
    const key = `${this.userPrefix}${userId}:context`;
    await this.client.setex(key, ttl, JSON.stringify(context));
  }

  // Get user context
  async getUserContext(userId) {
    const key = `${this.userPrefix}${userId}:context`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Set timer
  async setTimer(sessionId, timerId, duration, description) {
    const key = `timer:${sessionId}:${timerId}`;
    const timerData = {
      duration,
      description,
      startTime: Date.now()
    };
    await this.client.setex(key, duration, JSON.stringify(timerData));
  }

  // Get timer
  async getTimer(sessionId, timerId) {
    const key = `timer:${sessionId}:${timerId}`;
    const data = await this.client.get(key);
    if (data) {
      const timer = JSON.parse(data);
      const elapsed = Date.now() - timer.startTime;
      const remaining = Math.max(0, timer.duration * 1000 - elapsed);
      return {
        ...timer,
        remaining: Math.floor(remaining / 1000)
      };
    }
    return null;
  }

  // Delete timer
  async deleteTimer(sessionId, timerId) {
    const key = `timer:${sessionId}:${timerId}`;
    await this.client.del(key);
  }
}

// Graceful shutdown
async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed.');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  SessionManager,
  closeRedis
};