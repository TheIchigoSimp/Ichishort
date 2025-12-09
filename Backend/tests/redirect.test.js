import request from 'supertest';
import app from '../src/app.js';
import Url from '../src/models/url.js';

describe('Redirect Route', () => {
  describe('GET /:slug', () => {
    it('should redirect to target URL', async () => {
      // Create a URL first
      const url = await Url.create({
        slug: 'redirect-test',
        target: 'https://example.com'
      });

      const response = await request(app)
        .get('/redirect-test')
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    it('should return 404 if slug does not exist', async () => {
      const response = await request(app)
        .get('/nonexistent-slug');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Not Found');
    });

    it('should handle different target URLs', async () => {
      const url = await Url.create({
        slug: 'google-redirect',
        target: 'https://www.google.com'
      });

      const response = await request(app)
        .get('/google-redirect')
        .expect(302);

      expect(response.headers.location).toBe('https://www.google.com');
    });
  });
});

