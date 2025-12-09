import request from 'supertest';
import app from '../src/app.js';

describe('Health Check Route', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
    });
  });
});

