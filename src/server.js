const { createApp, buildPoolFromEnv } = require('./app');

// App Service (Linux/container) usa PORT ou WEBSITES_PORT; localmente cai em 3000.
const port =
  Number(process.env.PORT || process.env.WEBSITES_PORT) || 3000;
const pool = buildPoolFromEnv();
const app = createApp(pool);

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
}

async function start() {
  if (pool) {
    try {
      await ensureSchema();
    } catch (e) {
      console.error('Falha ao preparar schema (aguardando DB?):', e.message);
      process.exit(1);
    }
  } else {
    console.warn('DATABASE_URL não definido — API sobe sem PostgreSQL.');
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`API ouvindo na porta ${port}`);
  });
}

start();
