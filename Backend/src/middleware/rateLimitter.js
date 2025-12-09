import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redisClient from '../lib/redisClient' // adjust export name if needed

// Example: max 100 requests per 15 minutes per IP
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});

export default apiRateLimiter