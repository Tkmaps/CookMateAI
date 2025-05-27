const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../config/redis');

// Create rate limiter with Redis store
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis for distributed rate limiting
    store: {
      incr: async (key) => {
        const redis = getRedisClient();
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, Math.ceil(windowMs / 1000));
        }
        return { totalHits: current };
      },
      decrement: async (key) => {
        const redis = getRedisClient();
        return redis.decr(key);
      },
      resetKey: async (key) => {
        const redis = getRedisClient();
        return redis.del(key);
      }
    }
  });
};

// General API rate limiter
const rateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Voice processing rate limiter
const voiceRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // limit each IP to 30 voice requests per minute
  'Too many voice requests, please slow down.'
);

// AI coaching rate limiter
const coachRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  20, // limit each IP to 20 coaching requests per minute
  'Too many coaching requests, please slow down.'
);

module.exports = {
  rateLimiter,
  authRateLimiter,
  voiceRateLimiter,
  coachRateLimiter
};