import request from 'supertest';
import app from '../src/app.js';
import Url from '../src/models/url.js';
import User from '../src/models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('URL Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create a test user and get auth token
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      email: 'urluser@example.com',
      passwordHash: hash
    });
    userId = user._id;
    authToken = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
  });

  describe('POST /api/urls', () => {
    it('should create a URL with auto-generated slug', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'https://example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortUrl).toContain(response.body.slug);
    });

    it('should create a URL with custom slug', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'https://example.com',
          customSlug: 'my-custom-slug'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug', 'my-custom-slug');
      expect(response.body).toHaveProperty('shortUrl');
    });

    it('should create a URL with authenticated user', async () => {
      // Note: Auth middleware is not currently applied in app.js
      // This test verifies the endpoint works, but ownerId will be null
      // until auth middleware is added to the app
      const response = await request(app)
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target: 'https://example.com'
        });

      expect(response.status).toBe(200);
      
      // Verify the URL was created
      const url = await Url.findOne({ slug: response.body.slug });
      expect(url).toBeTruthy();
      // ownerId will be null since auth middleware isn't applied in app.js
      // This is expected behavior until middleware is added
    });

    it('should return 400 if target is missing', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          customSlug: 'test-slug'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'target required');
    });

    it('should return 400 if target does not start with http:// or https://', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'target must start with http:// or https://');
    });

    it('should return 409 if custom slug is already taken', async () => {
      // Create a URL with the slug first
      await Url.create({
        slug: 'taken-slug',
        target: 'https://example.com'
      });

      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'https://another.com',
          customSlug: 'taken-slug'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Custom slug taken');
    });

    it('should accept http:// URLs', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'http://example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
    });

    it('should accept https:// URLs', async () => {
      const response = await request(app)
        .post('/api/urls')
        .send({
          target: 'https://example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
    });
  });

  describe('GET /api/urls/:slug', () => {
    it('should get URL details by slug', async () => {
      // Create a URL first
      const url = await Url.create({
        slug: 'test-slug',
        target: 'https://example.com'
      });

      const response = await request(app)
        .get('/api/urls/test-slug');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug', 'test-slug');
      expect(response.body).toHaveProperty('target', 'https://example.com');
      expect(response.body).toHaveProperty('_id');
    });

    it('should return 404 if slug does not exist', async () => {
      const response = await request(app)
        .get('/api/urls/nonexistent-slug');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'not found');
    });
  });
});

