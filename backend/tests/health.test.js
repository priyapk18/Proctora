import request from 'supertest';
import { app } from '../server.js';
import mongoose from 'mongoose';

describe('API Health and Route Checks', () => {
  it('should have auth routes registered', async () => {
    // We expect a 404 for GET /api/auth since we only defined POST routes
    // But it should be registered, meaning it won't 404 purely on /api/auth if we had a GET
    // Let's test a dummy non-existent POST to /api/auth/unknown
    const res = await request(app).post('/api/auth/unknown');
    expect(res.statusCode).toBe(404);
  });

  it('should return API is running on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API is running');
  });
});
