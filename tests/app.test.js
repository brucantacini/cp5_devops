const request = require('supertest');
const { createApp, buildPoolFromEnv } = require('../src/app');

describe('API sem banco', () => {
  const app = createApp(null);

  test('GET /health retorna ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('cp5-demo-api');
  });

  test('GET /api/info sem DATABASE_URL', async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const res = await request(app).get('/api/info');
    process.env.DATABASE_URL = prev;
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('unavailable');
  });

  test('GET /api/items sem pool retorna lista vazia', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.source).toBe('no-database');
  });
});

describe('buildPoolFromEnv', () => {
  test('sem DATABASE_URL retorna null', () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(buildPoolFromEnv()).toBeNull();
    process.env.DATABASE_URL = prev;
  });
});
