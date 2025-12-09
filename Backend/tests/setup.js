import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redis from '../src/lib/redisClient.js';

dotenv.config();

// Use a test database
const TEST_MONGO_URI = process.env.TEST_MONGO_URI || process.env.MONGO_URI?.replace(/\/[^\/]+$/, '/url-shortener-test') || 'mongodb://localhost:27017/url-shortener-test';

// Connect to test database
beforeAll(async () => {
  try {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGO_URI);
      console.log('Test database connected');
    }
  } catch (error) {
    console.error('Test database connection error:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  // Close Redis connection if available
  try {
    await redis.quit();
  } catch (err) {
    // Redis might not be connected, ignore
  }
  console.log('Test database disconnected');
});

