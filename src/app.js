const express = require('express');
const { Pool } = require('pg');

function createApp(pool) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'cp5-demo-api' });
  });

  app.get('/api/info', async (_req, res) => {
    let dbOk = false;
    if (pool) {
      try {
        await pool.query('SELECT 1');
        dbOk = true;
      } catch {
        dbOk = false;
      }
    }
    res.json({
      nodeEnv: process.env.NODE_ENV || 'development',
      database: dbOk ? 'connected' : 'unavailable',
    });
  });

  app.get('/api/items', async (_req, res) => {
    if (!pool) {
      return res.json({ items: [], source: 'no-database' });
    }
    try {
      const r = await pool.query(
        'SELECT id, name FROM items ORDER BY id ASC LIMIT 100'
      );
      return res.json({ items: r.rows, source: 'postgres' });
    } catch (err) {
      return res.status(500).json({ error: 'database_error', message: err.message });
    }
  });

  app.post('/api/items', async (req, res) => {
    const name = (req.body && req.body.name) || '';
    if (!name.trim()) {
      return res.status(400).json({ error: 'name_required' });
    }
    if (!pool) {
      return res.status(503).json({ error: 'database_unavailable' });
    }
    try {
      const r = await pool.query(
        'INSERT INTO items (name) VALUES ($1) RETURNING id, name',
        [name.trim()]
      );
      return res.status(201).json(r.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: 'database_error', message: err.message });
    }
  });

  return app;
}

function buildPoolFromEnv() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return new Pool({ connectionString: url, max: 5 });
}

module.exports = { createApp, buildPoolFromEnv };
